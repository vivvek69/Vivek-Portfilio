"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/* ════════════════════════════════════════════════════════════════════
 * Emitter — a GPU particle ring buffer. JS only writes spawn data;
 * the vertex shader integrates motion from (spawn, velocity, age).
 * ════════════════════════════════════════════════════════════════════ */

export type EmitterKind = "smoke" | "spark" | "ember";

export type EmitterHandle = {
  emit: (pos: THREE.Vector3, vel: THREE.Vector3, life: number) => void;
  setUniform: (name: "uTone" | "uOpacity", v: number) => void;
};

const emitterVert = /* glsl */ `
  uniform float uTime;
  uniform float uDrag;
  uniform float uGravity;
  uniform float uTurb;
  uniform float uSize0;
  uniform float uSize1;
  uniform float uScale;
  uniform float uMaxPx;
  attribute vec3 aVel;
  attribute vec2 aLife; // born, lifetime
  attribute float aSeed;
  varying float vK;
  varying float vSeed;
  void main() {
    float age = uTime - aLife.x;
    float k = age / aLife.y;
    vK = k;
    vSeed = aSeed;
    if (k < 0.0 || k > 1.0 || aLife.y <= 0.0) {
      gl_Position = vec4(3.0, 3.0, 3.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    vec3 p = position + aVel * (1.0 - exp(-uDrag * age)) / uDrag;
    p.y += 0.5 * uGravity * age * age;
    p.x += sin(age * 1.3 + aSeed * 40.0) * uTurb * age;
    p.z += cos(age * 1.1 + aSeed * 23.0) * uTurb * age;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = mix(uSize0, uSize1, k) * (0.65 + aSeed * 0.7);
    gl_PointSize = min(size * uScale / max(0.1, -mv.z), uMaxPx);
  }
`;

const smokeFrag = /* glsl */ `
  uniform float uTone;    // 0 = light steam on white, 1 = dark smoke lit by fire
  uniform float uOpacity;
  varying float vK;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float wob = 0.06 * sin(atan(c.y, c.x) * 5.0 + vSeed * 30.0);
    float a = smoothstep(0.5 + wob, 0.05, d);
    a *= smoothstep(0.0, 0.12, vK) * pow(1.0 - vK, 1.4) * uOpacity;
    vec3 light = mix(vec3(0.32, 0.30, 0.29), vec3(0.62, 0.6, 0.58), vK);
    vec3 dark = mix(vec3(0.16, 0.05, 0.02), vec3(0.025, 0.02, 0.018), smoothstep(0.0, 0.5, vK));
    gl_FragColor = vec4(mix(light, dark, uTone), a * 0.55);
    #include <colorspace_fragment>
  }
`;

const fireFrag = /* glsl */ `
  uniform float uOpacity;
  uniform float uHeat;
  varying float vK;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    core *= core;
    float k = vK;
    vec3 hot = vec3(1.0, 0.85, 0.55);
    vec3 mid = vec3(1.0, 0.36, 0.06);
    vec3 cool = vec3(0.55, 0.06, 0.01);
    vec3 col = k < 0.35 ? mix(hot, mid, k / 0.35) : mix(mid, cool, (k - 0.35) / 0.65);
    float flick = 0.75 + 0.25 * sin(vSeed * 80.0 + k * 40.0);
    float a = core * (1.0 - k) * flick * uOpacity;
    gl_FragColor = vec4(col * uHeat * a, a);
    #include <colorspace_fragment>
  }
`;

const PRESETS: Record<EmitterKind, { drag: number; gravity: number; turb: number; size0: number; size1: number; frag: string; additive: boolean; heat: number }> = {
  smoke: { drag: 0.9, gravity: 0.35, turb: 0.35, size0: 1.2, size1: 5.0, frag: smokeFrag, additive: false, heat: 1 },
  spark: { drag: 1.6, gravity: -9, turb: 0.05, size0: 0.07, size1: 0.025, frag: fireFrag, additive: true, heat: 4 },
  ember: { drag: 0.5, gravity: 0.9, turb: 0.6, size0: 0.075, size1: 0.03, frag: fireFrag, additive: true, heat: 3 },
};

export function Emitter({ kind, max, scale, ref }: { kind: EmitterKind; max: number; scale: number; ref?: Ref<EmitterHandle> }) {
  const preset = PRESETS[kind];
  const cursor = useRef(0);
  const clock = useRef(0);

  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aVel", new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aLife", new THREE.BufferAttribute(new Float32Array(max * 2), 2).setUsage(THREE.DynamicDrawUsage));
    const seeds = new Float32Array(max);
    for (let i = 0; i < max; i++) seeds[i] = Math.random();
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: emitterVert,
      fragmentShader: preset.frag,
      transparent: true,
      depthWrite: false,
      blending: preset.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uDrag: { value: preset.drag },
        uGravity: { value: preset.gravity },
        uTurb: { value: preset.turb },
        uSize0: { value: preset.size0 },
        uSize1: { value: preset.size1 },
        uScale: { value: scale },
        uMaxPx: { value: preset.additive ? 24 : 420 },
        uTone: { value: 0 },
        uOpacity: { value: 1 },
        uHeat: { value: preset.heat },
      },
    });
    return { geometry: g, material: m };
  }, [max, preset, scale]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useImperativeHandle(ref, () => ({
    emit(pos, vel, life) {
      const i = cursor.current;
      cursor.current = (i + 1) % max;
      const p = geometry.attributes.position as THREE.BufferAttribute;
      const v = geometry.attributes.aVel as THREE.BufferAttribute;
      const l = geometry.attributes.aLife as THREE.BufferAttribute;
      p.setXYZ(i, pos.x, pos.y, pos.z);
      v.setXYZ(i, vel.x, vel.y, vel.z);
      l.setXY(i, clock.current, life);
      p.needsUpdate = true;
      v.needsUpdate = true;
      l.needsUpdate = true;
    },
    setUniform(name, v) {
      material.uniforms[name].value = v;
    },
  }));

  useFrame((_, dt) => {
    clock.current += Math.min(dt, 1 / 15);
    material.uniforms.uTime.value = clock.current;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={kind === "smoke" ? 2 : 3} />;
}

/* ════════════════════════════════════════════════════════════════════
 * Dissolve — the locomotive breaking into thousands of glowing particles.
 * Points are sampled from the real mesh surfaces (MeshSurfaceSampler),
 * so the cloud starts in the exact shape of the train.
 * ════════════════════════════════════════════════════════════════════ */

const dissolveVert = /* glsl */ `
  uniform float uT;
  uniform float uScale;
  uniform float uFront;
  uniform float uLength;
  attribute vec4 aRand;
  varying float vHeat;
  varying float vAlpha;
  void main() {
    // the dissolve sweeps from the front of the train to the back
    float delay = clamp((uFront - position.z) / uLength, 0.0, 1.0) * 0.55 + aRand.w * 0.12;
    float t = max(uT - delay, 0.0);
    float life = 1.5 + aRand.x * 2.3;
    float k = clamp(t / life, 0.0, 1.0);
    vec3 outward = normalize(vec3(position.x, position.y - 2.0, 0.6) + (aRand.xyz - 0.5) * 1.6);
    float speed = 1.5 + aRand.y * 5.5;
    vec3 p = position;
    p += outward * speed * (1.0 - exp(-t * 1.8));
    p.z += 6.0 * (1.0 - exp(-t * 1.3)) * (0.4 + aRand.z);   // carried momentum
    p.y += t * t * (0.35 + aRand.x * 0.9);                   // heat rising
    p.x += sin(t * 2.2 + aRand.z * 6.283) * t * 0.55;        // swirling
    p.z += cos(t * 1.7 + aRand.y * 6.283) * t * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float pre = step(uT, delay);       // still holding the train's shape
    vHeat = mix(0.92 - k * 1.05, 0.78 + aRand.y * 0.2, pre);
    vAlpha = mix(1.0 - smoothstep(0.45, 1.0, k), 1.0, pre);
    float size = (0.012 + aRand.w * aRand.w * 0.05) * (1.0 + 1.4 * smoothstep(0.0, 0.25, t) * (1.0 - k));
    gl_PointSize = min(size * uScale / max(0.1, -mv.z), 14.0);
  }
`;

const dissolveFrag = /* glsl */ `
  uniform float uIntensity;
  varying float vHeat;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a * vAlpha;
    vec3 white = vec3(1.0, 0.93, 0.78);
    vec3 gold = vec3(1.0, 0.62, 0.16);
    vec3 orange = vec3(1.0, 0.3, 0.04);
    vec3 red = vec3(0.45, 0.04, 0.0);
    float h = vHeat;
    vec3 col = h > 0.7 ? mix(gold, white, (h - 0.7) / 0.3)
             : h > 0.35 ? mix(orange, gold, (h - 0.35) / 0.35)
             : mix(red, orange, h / 0.35);
    gl_FragColor = vec4(col * uIntensity * a, a);
    #include <colorspace_fragment>
  }
`;

export type DissolveHandle = { build: (source: THREE.Object3D) => void; start: () => void; setTime: (t: number) => void };

export function Dissolve({ count, scale, ref }: { count: number; scale: number; ref?: Ref<DissolveHandle> }) {
  const points = useRef<THREE.Points>(null);
  const t = useRef(-1);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dissolveVert,
        fragmentShader: dissolveFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uT: { value: 0 },
          uScale: { value: scale },
          uFront: { value: 5.5 },
          uLength: { value: 20 },
          uIntensity: { value: 1.7 },
        },
      }),
    [scale]
  );
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);

  useEffect(() => () => {
    material.dispose();
    geometry.dispose();
  }, [material, geometry]);

  useImperativeHandle(ref, () => ({
    build(source) {
      source.updateMatrixWorld(true);
      const rootInv = new THREE.Matrix4().copy(source.matrixWorld).invert();
      const meshes: { mesh: THREE.Mesh; area: number; matrix: THREE.Matrix4 }[] = [];
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const c = new THREE.Vector3();
      const tri = new THREE.Triangle();
      source.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || !m.geometry) return;
        const matrix = new THREE.Matrix4().multiplyMatrices(rootInv, m.matrixWorld);
        const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        g.applyMatrix4(matrix);
        const pos = g.attributes.position;
        let area = 0;
        for (let i = 0; i < pos.count; i += 3) {
          a.fromBufferAttribute(pos, i);
          b.fromBufferAttribute(pos, i + 1);
          c.fromBufferAttribute(pos, i + 2);
          area += tri.set(a, b, c).getArea();
        }
        const sm = new THREE.Mesh(g);
        meshes.push({ mesh: sm, area, matrix });
      });
      const total = meshes.reduce((s, m) => s + m.area, 0) || 1;
      const positions = new Float32Array(count * 3);
      const rands = new Float32Array(count * 4);
      const p = new THREE.Vector3();
      let n = 0;
      let minZ = Infinity;
      let maxZ = -Infinity;
      for (const entry of meshes) {
        const want = Math.round((entry.area / total) * count);
        if (want <= 0) continue;
        const sampler = new MeshSurfaceSampler(entry.mesh).build();
        for (let i = 0; i < want && n < count; i++, n++) {
          sampler.sample(p);
          positions.set([p.x, p.y, p.z], n * 3);
          rands.set([Math.random(), Math.random(), Math.random(), Math.random()], n * 4);
          minZ = Math.min(minZ, p.z);
          maxZ = Math.max(maxZ, p.z);
        }
        entry.mesh.geometry.dispose();
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aRand", new THREE.BufferAttribute(rands, 4));
      geometry.setDrawRange(0, n);
      material.uniforms.uFront.value = maxZ;
      material.uniforms.uLength.value = Math.max(1, maxZ - minZ);
    },
    start() {
      t.current = 0;
      if (points.current) points.current.visible = true;
    },
    setTime(v) {
      t.current = v;
      if (points.current) points.current.visible = v >= 0;
    },
  }));

  useFrame((_, dt) => {
    if (t.current < 0) return;
    t.current += Math.min(dt, 1 / 15);
    material.uniforms.uT.value = t.current;
    if (t.current > 7 && points.current) points.current.visible = false;
  });

  return <points ref={points} geometry={geometry} material={material} visible={false} frustumCulled={false} renderOrder={4} />;
}

/* ════════════════════════════════════════════════════════════════════
 * BurnBackdrop — full-screen background. Starts as a white void; burns
 * away from the centre with a glowing, noisy edge into cinematic black.
 * ════════════════════════════════════════════════════════════════════ */

const burnVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const burnFrag = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uCenter;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }

  void main() {
    vec2 asp = vec2(uAspect, 1.0);
    vec2 q = (vUv - uCenter) * asp;
    float r = length(q);
    float n = fbm(vUv * asp * 3.2 + vec2(0.0, uTime * 0.05));

    // white void with a whisper of warm vignette
    vec3 paper = toLinear(vec3(0.965, 0.955, 0.94)) * (1.0 - 0.07 * smoothstep(0.4, 1.2, r));

    // cinematic darkness, lit from below by the fire
    float glowY = 1.0 - smoothstep(0.0, 0.75, vUv.y);
    float flick = 0.85 + 0.15 * sin(uTime * 3.1 + n * 6.0);
    vec3 dark = toLinear(vec3(0.02, 0.016, 0.013));
    dark += vec3(0.11, 0.022, 0.004) * glowY * glowY * flick;
    dark += vec3(0.05, 0.008, 0.002) * (1.0 - smoothstep(0.0, 0.9, length((vUv - vec2(0.72, 0.42)) * asp)));
    // drifting embers in the dark
    float speck = step(0.986, noise(vUv * asp * 90.0 + vec2(0.0, -uTime * 0.6)));
    dark += vec3(1.2, 0.4, 0.06) * speck * glowY * 0.5;

    float front = uProgress * 2.6 - 0.45;
    float e = front - r - (n - 0.5) * 0.7;

    vec3 col = paper;
    col = mix(col, toLinear(vec3(0.42, 0.24, 0.12)), smoothstep(-0.10, 0.0, e) * 0.85 * step(0.001, uProgress));   // scorching
    col = mix(col, dark, smoothstep(0.0, 0.015, e));                                     // burnt through
    float live = (1.0 - smoothstep(0.82, 1.0, uProgress)) * smoothstep(0.0, 0.06, uProgress);
    float rim = exp(-abs(e) * 38.0) * live;
    col += vec3(3.2, 1.15, 0.22) * rim;                                                  // burning edge (HDR → bloom)
    col += vec3(1.4, 0.35, 0.05) * exp(-max(e, 0.0) * 9.0) * step(0.0, e) * live * 0.6; // afterglow

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export type BurnHandle = { material: THREE.ShaderMaterial };

export function BurnBackdrop({ ref }: { ref?: Ref<BurnHandle> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: burnVert,
        fragmentShader: burnFrag,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uCenter: { value: new THREE.Vector2(0.42, 0.52) },
        },
      }),
    []
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(() => () => {
    material.dispose();
    geometry.dispose();
  }, [material, geometry]);
  useImperativeHandle(ref, () => ({ material }));

  useFrame((state, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 1 / 15);
    material.uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-100} />;
}
