"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { gsap } from "gsap";
import type { BloomEffect } from "postprocessing";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fireAudio } from "../../fx/audio";
import { driveRig, Locomotive, LOCO_FRONT_Z, type LocoRig } from "./Locomotive";
import { BurnBackdrop, Dissolve, Emitter, type BurnHandle, type DissolveHandle, type EmitterHandle } from "./particles";

export type Quality = "high" | "low";

export type TrainStageProps = {
  quality: Quality;
  paused: boolean;
  /** Increment to skip straight to the final composition. */
  skipToken: number;
  onReady: () => void;
  onReveal: () => void;
  onComplete: () => void;
  onLost: () => void;
};

/* Timeline beats (seconds) */
const T_START = 0.7;
const T_ARRIVE = 6.1;
const T_HEAT = 5.3;
const T_BURST = 6.15;
const T_REVEAL = 6.9;
const T_DONE = 9.0;
const Z_START = -150;
const Z_END = 1.6;

/* ─────────────────────────── Track ─────────────────────────── */
function Track() {
  const sleepers = useRef<THREE.InstancedMesh>(null);
  const COUNT = 320;
  useLayoutEffect(() => {
    const m = sleepers.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < COUNT; i++) {
      o.position.set((Math.random() - 0.5) * 0.04, 0.06, 30 - i * 0.9);
      o.rotation.y = (Math.random() - 0.5) * 0.02;
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <mesh position={[0, -0.01, -110]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 300]} />
        <meshStandardMaterial color="#cbc3b8" roughness={1} />
      </mesh>
      <instancedMesh ref={sleepers} args={[undefined, undefined, COUNT]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.12, 0.26]} />
        <meshStandardMaterial color="#3a2b22" roughness={0.9} />
      </instancedMesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.14, -110]} receiveShadow castShadow>
          <boxGeometry args={[0.09, 0.14, 300]} />
          <meshStandardMaterial color="#5d5a58" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────── Director ─────────────────────────── */
function Director({ quality, skipToken, onReady, onReveal, onComplete }: Omit<TrainStageProps, "paused" | "onLost">) {
  const { camera, scene, size, gl } = useThree();
  const root = useRef<THREE.Group>(null);
  const rig = useRef<LocoRig | null>(null);
  const dissolve = useRef<DissolveHandle>(null);
  const smoke = useRef<EmitterHandle>(null);
  const sparks = useRef<EmitterHandle>(null);
  const embers = useRef<EmitterHandle>(null);
  const burn = useRef<BurnHandle>(null);
  const bloom = useRef<BloomEffect>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const fireLight = useRef<THREE.PointLight>(null);
  const headSpot = useRef<THREE.SpotLight>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const callbacks = useRef({ onReveal, onComplete });
  callbacks.current = { onReveal, onComplete };

  const high = quality === "high";
  const fov = size.width / size.height < 0.85 ? 62 : 42;
  const pointScale = (size.height * Math.min(gl.getPixelRatio(), 2)) / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));

  const s = useRef({
    z: Z_START,
    heat: 0,
    burn: 0,
    fire: 0,
    bloom: 0.55,
    burstAt: -1,
    exposed: true,
    shake: 0,
    settle: 0,
    smokeAcc: 0,
    sparkAcc: 0,
    emberAcc: 0,
    elapsed: 0,
  });

  const fog = useMemo(() => new THREE.Fog("#f6f3ee", 30, 260), []);
  const white = useMemo(() => new THREE.Color("#f6f3ee"), []);
  const black = useMemo(() => new THREE.Color("#050403"), []);
  const heatColor = useMemo(() => new THREE.Color("#ff4a0a"), []);
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  const burstNow = () => {
    const st = s.current;
    if (!rig.current || st.burstAt >= 0) return;
    st.burstAt = st.elapsed;
    st.shake = 1;
    rig.current.body.visible = false;
    dissolve.current?.start();
    fireAudio.stopTrain();
    fireAudio.ignite();
    // a burst of sparks from the hull
    const origin = root.current!.position;
    for (let i = 0; i < (high ? 260 : 120); i++) {
      tmp.v.set(origin.x + (Math.random() - 0.5) * 2.6, 0.4 + Math.random() * 3.6, origin.z + LOCO_FRONT_Z - Math.random() * 6);
      tmp.w.set((Math.random() - 0.5) * 10, Math.random() * 9, 2 + Math.random() * 8);
      sparks.current?.emit(tmp.v, tmp.w, 0.8 + Math.random() * 1.4);
    }
  };

  // Build the timeline once the rig exists
  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      if (cancelled || !rig.current) return;
      // sample particle positions from the real meshes before anything moves
      dissolve.current?.build(rig.current.body);
      onReady();
      const st = s.current;
      // paused: the timeline is advanced by the render clock in useFrame, so
      // motion, particles and camera stay in sync even when frames drop
      const t = gsap.timeline({ paused: true });
      t.to(st, { z: Z_END, duration: T_ARRIVE - T_START, ease: "power1.in" }, T_START)
        .call(() => fireAudio.whistle(), [], 1.6)
        .to(st, { heat: 1, duration: T_BURST - T_HEAT, ease: "power2.in" }, T_HEAT)
        .to(st, { bloom: 1.35, duration: 0.25, ease: "power2.out" }, T_BURST - 0.1)
        .call(burstNow, [], T_BURST)
        .to(st, { burn: 1, duration: 2.2, ease: "power3.out" }, T_BURST - 0.3)
        .to(st, { fire: 1, duration: 0.3, ease: "power3.out" }, T_BURST)
        .to(st, { fire: 0.35, duration: 2.6, ease: "power2.inOut" }, T_BURST + 0.3)
        .to(st, { bloom: 1.05, duration: 2.0 }, T_BURST + 0.4)
        .to(st, { settle: 1, duration: 3.2, ease: "power2.inOut" }, T_BURST + 0.2)
        .call(() => callbacks.current.onReveal(), [], T_REVEAL)
        .call(() => callbacks.current.onComplete(), [], T_DONE);
      tl.current = t;
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      tl.current?.kill();
      fireAudio.stopTrain();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip → jump to the final composition
  useEffect(() => {
    if (skipToken === 0) return;
    tl.current?.kill();
    tl.current = null;
    const st = s.current;
    st.z = Z_END;
    st.heat = 1;
    if (rig.current) rig.current.body.visible = false;
    if (st.burstAt < 0) st.burstAt = st.elapsed - 10;
    dissolve.current?.setTime(-1);
    st.burn = 1;
    st.fire = 0.35;
    st.bloom = 1.05;
    st.settle = 1;
    st.shake = 0;
    fireAudio.stopTrain();
    callbacks.current.onReveal();
    callbacks.current.onComplete();
  }, [skipToken]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 15);
    const st = s.current;
    st.elapsed += dt;
    if (tl.current && tl.current.progress() < 1) {
      tl.current.time(Math.max(0, tl.current.time() + dt));
    }
    const r = rig.current;
    const g = root.current;
    if (!r || !g) return;

    /* train motion */
    const prevZ = g.position.z;
    g.position.z = st.z;
    const dz = st.z - prevZ;
    const speed = dz / Math.max(dt, 1e-4);
    const speedN = THREE.MathUtils.clamp(speed / 45, 0, 1);
    const prox = THREE.MathUtils.clamp((st.z - Z_START) / (Z_END - Z_START), 0, 1);
    if (r.body.visible) {
      driveRig(r, dz);
      fireAudio.train(prox, speedN);
    }

    /* heat build-up: the hull glows red-hot before it breaks apart */
    for (const m of r.materials) {
      m.emissive.copy(heatColor);
      m.emissiveIntensity = st.heat * st.heat * 2.2;
    }
    r.lensMaterial.emissiveIntensity = 7 + Math.sin(st.elapsed * 30) * 0.6 + st.heat * 10;

    /* smoke & steam while the train runs */
    if (r.body.visible) {
      st.smokeAcc += dt * (high ? 20 + speedN * 50 : 10 + speedN * 22);
      r.chimneyTop.getWorldPosition(tmp.v);
      while (st.smokeAcc >= 1) {
        st.smokeAcc -= 1;
        tmp.w.set((Math.random() - 0.5) * 0.9, 3.2 + Math.random() * 1.6, -speed * 0.08 + (Math.random() - 0.5));
        smoke.current?.emit(tmp.v, tmp.w, 2.2 + Math.random() * 1.6);
      }
      if (speedN > 0.25) {
        st.sparkAcc += dt * speedN * (high ? 90 : 40);
        while (st.sparkAcc >= 1) {
          st.sparkAcc -= 1;
          const c = r.wheelContacts[(Math.random() * r.wheelContacts.length) | 0];
          c.getWorldPosition(tmp.v);
          tmp.w.set((Math.random() - 0.5) * 3, 1 + Math.random() * 3.5, -2 - Math.random() * 6);
          sparks.current?.emit(tmp.v, tmp.w, 0.25 + Math.random() * 0.45);
        }
        // occasional cylinder steam
        if (Math.random() < dt * 3) {
          const v = r.cylinderVents[(Math.random() * r.cylinderVents.length) | 0];
          v.getWorldPosition(tmp.v);
          tmp.w.set(Math.sign(tmp.v.x) * (1.5 + Math.random()), 0.3, -1);
          smoke.current?.emit(tmp.v, tmp.w, 0.9);
        }
      }
    }

    /* after the burst: embers and dark smoke keep rising from the remains */
    if (st.burstAt >= 0) {
      const since = st.elapsed - st.burstAt;
      const rate = (high ? 70 : 30) * (0.5 + 1.5 * Math.exp(-since * 0.6));
      st.emberAcc += dt * rate;
      while (st.emberAcc >= 1) {
        st.emberAcc -= 1;
        const wide = Math.random() < 0.6;
        tmp.v.set(
          wide ? -10 + Math.random() * 20 : (Math.random() - 0.5) * 3,
          wide ? -0.5 + Math.random() * 1.5 : 0.3 + Math.random() * 2.5,
          g.position.z + (wide ? -8 + Math.random() * 10 : Math.random() * 5)
        );
        tmp.w.set((Math.random() - 0.5) * 1.2, 0.8 + Math.random() * 2.2, (Math.random() - 0.5) * 1.2);
        embers.current?.emit(tmp.v, tmp.w, 2.5 + Math.random() * 3.5);
      }
      st.smokeAcc += dt * (high ? 5 : 2.5);
      while (st.smokeAcc >= 1) {
        st.smokeAcc -= 1;
        tmp.v.set((Math.random() - 0.5) * 8, 0.2, g.position.z + Math.random() * 4 - 3);
        tmp.w.set((Math.random() - 0.5) * 0.6, 1.2 + Math.random(), (Math.random() - 0.5) * 0.5);
        smoke.current?.emit(tmp.v, tmp.w, 6 + Math.random() * 4);
      }
    }

    /* world tone: white void → cinematic black */
    const b = st.burn;
    fog.color.copy(white).lerp(black, Math.min(1, b * 1.4));
    fog.near = THREE.MathUtils.lerp(30, 8, b);
    fog.far = THREE.MathUtils.lerp(260, 70, b);
    smoke.current?.setUniform("uTone", Math.min(1, b * 1.6));
    if (burn.current) burn.current.material.uniforms.uProgress.value = b;
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(1.35, 0.04, Math.min(1, b * 1.5));
    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(2.6, 0.12, Math.min(1, b * 1.5));
      key.current.position.set(g.position.x + 6, 12, g.position.z + 8);
      key.current.target.position.set(g.position.x, 0, g.position.z);
      key.current.target.updateMatrixWorld();
    }
    if (headSpot.current) {
      r.headlight.getWorldPosition(tmp.v);
      headSpot.current.position.copy(tmp.v);
      headSpot.current.target.position.set(tmp.v.x, 0, tmp.v.z + 30);
      headSpot.current.target.updateMatrixWorld();
      headSpot.current.intensity = r.body.visible ? 60 : 0;
    }
    if (fireLight.current) {
      fireLight.current.position.set(g.position.x, 1.6, g.position.z + 3);
      fireLight.current.intensity = st.fire * 90 * (0.85 + 0.15 * Math.sin(st.elapsed * 13) * Math.sin(st.elapsed * 7.3));
    }
    if (bloom.current) bloom.current.intensity = st.bloom;

    /* camera: low and close to the track, then settling into the hero frame */
    const portrait = size.width / size.height < 0.85;
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const startPos = portrait ? [1.9, 1.9, 15.5] : [3.5, 1.65, 11];
    const endPos = portrait ? [1.2, 3.0, 16] : [2.2, 2.6, 13];
    const e = st.settle;
    const push = prox * prox * 0.9;
    const px = THREE.MathUtils.lerp(startPos[0], endPos[0], e);
    const py = THREE.MathUtils.lerp(startPos[1], endPos[1], e);
    const pz = THREE.MathUtils.lerp(startPos[2] - push, endPos[2], e);
    st.shake *= Math.exp(-dt * 2.2);
    const rumble = r.body.visible ? Math.pow(prox, 4) * 0.05 : 0;
    const amp = rumble + st.shake * 0.35;
    const tt = st.elapsed;
    cam.position.set(
      px + (Math.sin(tt * 37.1) + Math.sin(tt * 23.3)) * amp * 0.5,
      py + (Math.sin(tt * 41.7) + Math.cos(tt * 19.9)) * amp * 0.5,
      pz
    );
    tmp.look.set(
      THREE.MathUtils.lerp(-0.4, 0.2, e),
      THREE.MathUtils.lerp(2.0, 2.4, e) + Math.sin(tt * 0.4) * 0.05 * e,
      THREE.MathUtils.lerp(-30, -12, e)
    );
    cam.lookAt(tmp.look);
  });

  return (
    <>
      <BurnBackdrop ref={burn} />
      <hemisphereLight ref={hemi} args={["#ffffff", "#b5a594", 1.35]} />
      <directionalLight
        ref={key}
        intensity={2.6}
        color="#fff4e6"
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 6, -14]} intensity={0.8} color="#d9e2ff" />
      <spotLight ref={headSpot} angle={0.35} penumbra={0.6} distance={60} decay={1.2} color="#ffe2b0" intensity={60} />
      <pointLight ref={fireLight} color="#ff6a1a" distance={40} decay={1.4} intensity={0} />
      <Track />
      <group ref={root} position={[0, 0, Z_START]}>
        <Locomotive rigRef={rig} />
        <Dissolve ref={dissolve} count={high ? 26000 : 9000} scale={pointScale} />
      </group>
      <Emitter ref={smoke} kind="smoke" max={high ? 700 : 300} scale={pointScale} />
      <Emitter ref={sparks} kind="spark" max={high ? 900 : 400} scale={pointScale} />
      <Emitter ref={embers} kind="ember" max={high ? 900 : 380} scale={pointScale} />
      {high && (
        <EffectComposer multisampling={4}>
          <Bloom ref={bloom} mipmapBlur intensity={0.55} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.75} />
          <Vignette offset={0.3} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export default function TrainStage(props: TrainStageProps) {
  const { quality, paused, onLost } = props;
  return (
    <Canvas
      flat
      shadows={quality === "high"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: 42, near: 0.1, far: 400, position: [3.5, 1.65, 11] }}
      gl={{ antialias: quality !== "high", powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f6f3ee");
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onLost();
        });
      }}
      aria-hidden
    >
      <Director {...props} />
    </Canvas>
  );
}
