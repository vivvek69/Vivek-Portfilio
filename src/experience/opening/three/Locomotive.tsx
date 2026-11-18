"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Original procedural steam locomotive + tender + one coach.
 * Faces +Z (towards the camera). Rails top at y = 0.2.
 */

export type LocoRig = {
  body: THREE.Group;
  wheels: { mesh: THREE.Object3D; radius: number }[];
  couplingRods: { mesh: THREE.Object3D; side: number }[];
  mainRods: { mesh: THREE.Mesh; side: number }[];
  chimneyTop: THREE.Object3D;
  cylinderVents: THREE.Object3D[];
  wheelContacts: THREE.Object3D[];
  headlight: THREE.Object3D;
  materials: THREE.MeshStandardMaterial[];
  lensMaterial: THREE.MeshStandardMaterial;
  angle: number;
};

const RAIL_TOP = 0.2;
const DRIVE_R = 0.78;
const SMALL_R = 0.45;
const DRIVE_AXLE_Y = RAIL_TOP + DRIVE_R;
const CRANK = 0.3;
const DRIVE_Z = [1.7, 0, -1.7];

function makeWheelGeometry(radius: number, spokes: number) {
  const parts: THREE.BufferGeometry[] = [];
  const steel: THREE.BufferGeometry[] = [];
  // tyre (steel)
  const tyre = new THREE.CylinderGeometry(radius, radius, 0.16, 40, 1, true);
  tyre.rotateZ(Math.PI / 2);
  steel.push(tyre);
  const flange = new THREE.TorusGeometry(radius - 0.02, 0.035, 6, 40);
  flange.rotateY(Math.PI / 2);
  flange.translate(-0.07, 0, 0);
  steel.push(flange);
  // wheel centre (painted)
  const disc = new THREE.RingGeometry(radius * 0.84, radius - 0.01, 40);
  disc.rotateY(Math.PI / 2);
  disc.translate(0.081, 0, 0);
  parts.push(disc);
  const hub = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, 0.22, 20);
  hub.rotateZ(Math.PI / 2);
  parts.push(hub);
  for (let i = 0; i < spokes; i++) {
    const s = new THREE.BoxGeometry(0.06, radius * 0.7, 0.07);
    s.translate(0.04, radius * 0.5, 0);
    s.rotateX((i / spokes) * Math.PI * 2);
    parts.push(s);
  }
  // counterweight crescent
  const cw = new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.1, 24, 1, false, -0.7, 1.4);
  cw.rotateZ(Math.PI / 2);
  cw.rotateX(Math.PI);
  cw.translate(0.05, 0, 0);
  parts.push(cw);
  const painted = mergeGeometries(parts.map((g) => g.toNonIndexed()));
  const metal = mergeGeometries(steel.map((g) => g.toNonIndexed()));
  const merged = mergeGeometries([painted!, metal!], true)!;
  parts.forEach((g) => g.dispose());
  steel.forEach((g) => g.dispose());
  return merged;
}

function makePilotGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.12);
  shape.lineTo(0.85, 0.12);
  shape.lineTo(0, 0.95);
  shape.lineTo(0, 0.12);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(1.1, 0, 0);
  return g;
}

export function Locomotive({ rigRef }: { rigRef: RefObject<LocoRig | null> }) {
  const body = useRef<THREE.Group>(null);
  const chimneyTop = useRef<THREE.Object3D>(null);
  const headlight = useRef<THREE.Object3D>(null);

  const mats = useMemo(() => {
    const black = new THREE.MeshStandardMaterial({ color: "#1b1613", metalness: 0.55, roughness: 0.42 });
    const dark = new THREE.MeshStandardMaterial({ color: "#0e0b09", metalness: 0.35, roughness: 0.65 });
    const red = new THREE.MeshStandardMaterial({ color: "#7d1a0d", metalness: 0.25, roughness: 0.5 });
    const brass = new THREE.MeshStandardMaterial({ color: "#c8954a", metalness: 1, roughness: 0.28 });
    const steel = new THREE.MeshStandardMaterial({ color: "#8d8a88", metalness: 1, roughness: 0.32 });
    const coach = new THREE.MeshStandardMaterial({ color: "#2b0e0a", metalness: 0.3, roughness: 0.55 });
    const glass = new THREE.MeshStandardMaterial({ color: "#ffcf86", emissive: "#ffb347", emissiveIntensity: 2.2, roughness: 0.2 });
    const lens = new THREE.MeshStandardMaterial({ color: "#fff2d0", emissive: "#fff0c8", emissiveIntensity: 7, roughness: 0.1 });
    return { black, dark, red, brass, steel, coach, glass, lens };
  }, []);

  const geo = useMemo(() => {
    const driveWheel = makeWheelGeometry(DRIVE_R, 12);
    const smallWheel = makeWheelGeometry(SMALL_R, 8);
    const pilot = makePilotGeometry();
    return { driveWheel, smallWheel, pilot };
  }, []);

  const wheelRefs = useRef<THREE.Object3D[]>([]);
  const wheelRadii = useRef<number[]>([]);
  const coupling = useRef<{ mesh: THREE.Object3D; side: number }[]>([]);
  const mainRods = useRef<{ mesh: THREE.Mesh; side: number }[]>([]);
  const vents = useRef<THREE.Object3D[]>([]);
  const contacts = useRef<THREE.Object3D[]>([]);

  useLayoutEffect(() => {
    if (!body.current || !chimneyTop.current || !headlight.current) return;
    rigRef.current = {
      body: body.current,
      wheels: wheelRefs.current.map((mesh, i) => ({ mesh, radius: wheelRadii.current[i] })),
      couplingRods: coupling.current,
      mainRods: mainRods.current,
      chimneyTop: chimneyTop.current,
      cylinderVents: vents.current,
      wheelContacts: contacts.current,
      headlight: headlight.current,
      materials: [mats.black, mats.dark, mats.red, mats.brass, mats.steel, mats.coach],
      lensMaterial: mats.lens,
      angle: 0,
    };
  });

  // dispose GPU resources on unmount
  useLayoutEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [mats, geo]
  );

  let wi = 0;
  const wheel = (key: string, x: number, y: number, z: number, radius: number) => {
    const idx = wi++;
    const flip = x < 0;
    return (
      <mesh
        key={key}
        ref={(m) => {
          if (m) {
            wheelRefs.current[idx] = m;
            wheelRadii.current[idx] = radius;
          }
        }}
        geometry={radius === DRIVE_R ? geo.driveWheel : geo.smallWheel}
        material={[mats.red, mats.steel]}
        position={[x, y, z]}
        scale={[flip ? -1 : 1, 1, 1]}
        castShadow
      />
    );
  };

  const side = [1, -1];

  return (
    <group ref={body}>
      {/* ── chassis ── */}
      <mesh material={mats.dark} position={[0, 1.18, 0.6]} castShadow>
        <boxGeometry args={[1.9, 0.42, 7.6]} />
      </mesh>
      {side.map((s) => (
        <mesh key={`board${s}`} material={mats.black} position={[s * 1.3, 1.56, 0.9]} castShadow>
          <boxGeometry args={[0.5, 0.06, 5.4]} />
        </mesh>
      ))}
      {side.map((s) => (
        <mesh key={`valance${s}`} material={mats.red} position={[s * 1.55, 1.47, 0.9]}>
          <boxGeometry args={[0.04, 0.16, 5.4]} />
        </mesh>
      ))}

      {/* ── boiler ── */}
      <mesh material={mats.black} position={[0, 2.25, 0.9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 5.0, 40]} />
      </mesh>
      {[-1.2, 0.3, 1.8, 3.0].map((z) => (
        <mesh key={`band${z}`} material={mats.brass} position={[0, 2.25, z]}>
          <torusGeometry args={[0.965, 0.03, 8, 48]} />
        </mesh>
      ))}
      {/* smokebox */}
      <mesh material={mats.dark} position={[0, 2.25, 3.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.02, 1.02, 0.95, 40]} />
      </mesh>
      <mesh material={mats.black} position={[0, 2.25, 4.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.82, 0.86, 0.08, 40]} />
      </mesh>
      <mesh material={mats.brass} position={[0, 2.25, 4.39]}>
        <torusGeometry args={[0.83, 0.035, 8, 48]} />
      </mesh>
      <mesh material={mats.brass} position={[0, 2.25, 4.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
      </mesh>
      {/* smoke deflectors */}
      {side.map((s) => (
        <mesh key={`defl${s}`} material={mats.black} position={[s * 1.42, 2.35, 3.6]} castShadow>
          <boxGeometry args={[0.05, 1.5, 1.4]} />
        </mesh>
      ))}

      {/* chimney */}
      <mesh material={mats.black} position={[0, 3.55, 3.75]} castShadow>
        <cylinderGeometry args={[0.38, 0.3, 0.9, 28]} />
      </mesh>
      <mesh material={mats.black} position={[0, 4.04, 3.75]}>
        <cylinderGeometry args={[0.45, 0.4, 0.14, 28]} />
      </mesh>
      <mesh material={mats.red} position={[0, 4.12, 3.75]}>
        <torusGeometry args={[0.42, 0.03, 6, 28]} />
      </mesh>
      <object3D ref={chimneyTop} position={[0, 4.25, 3.75]} />

      {/* domes */}
      <mesh material={mats.black} position={[0, 3.2, 1.3]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.35, 28]} />
      </mesh>
      <mesh material={mats.brass} position={[0, 3.42, 1.3]} scale={[1, 0.75, 1]} castShadow>
        <sphereGeometry args={[0.42, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.black} position={[0, 3.18, 2.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.38, 0.3, 24]} />
      </mesh>
      <mesh material={mats.black} position={[0, 3.36, 2.5]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* whistle */}
      <mesh material={mats.brass} position={[0.3, 3.5, -0.9]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
      </mesh>

      {/* headlight */}
      <group ref={headlight} position={[0, 3.42, 4.15]}>
        <mesh material={mats.black} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.26, 0.4, 24]} />
        </mesh>
        <mesh material={mats.lens} position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.02, 24]} />
        </mesh>
      </group>

      {/* ── cab ── */}
      <mesh material={mats.black} position={[0, 2.55, -2.35]} castShadow>
        <boxGeometry args={[2.5, 2.4, 1.9]} />
      </mesh>
      <mesh material={mats.dark} position={[0, 3.83, -2.4]} castShadow>
        <boxGeometry args={[2.85, 0.14, 2.4]} />
      </mesh>
      <mesh material={mats.red} position={[0, 1.95, -2.35]}>
        <boxGeometry args={[2.54, 0.08, 1.94]} />
      </mesh>
      {side.map((s) => (
        <mesh key={`cabwin${s}`} material={mats.glass} position={[s * 0.62, 3.05, -1.39]}>
          <boxGeometry args={[0.5, 0.55, 0.02]} />
        </mesh>
      ))}
      {side.map((s) => (
        <mesh key={`cabside${s}`} material={mats.glass} position={[s * 1.26, 3.0, -2.3]}>
          <boxGeometry args={[0.02, 0.6, 0.8]} />
        </mesh>
      ))}

      {/* ── cylinders + motion ── */}
      {side.map((s) => (
        <group key={`cyl${s}`}>
          <mesh material={mats.black} position={[s * 1.25, 1.05, 3.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 1.2, 24]} />
          </mesh>
          {[2.45, 3.65].map((z) => (
            <mesh key={z} material={mats.brass} position={[s * 1.25, 1.05, z]}>
              <torusGeometry args={[0.36, 0.025, 6, 24]} />
            </mesh>
          ))}
          <mesh material={mats.steel} position={[s * 1.25, 1.05, 2.2]}>
            <boxGeometry args={[0.1, 0.12, 0.9]} />
          </mesh>
          <object3D
            ref={(o) => {
              if (o && !vents.current.includes(o)) vents.current.push(o);
            }}
            position={[s * 1.25, 0.7, 3.6]}
          />
        </group>
      ))}

      {/* driving wheels */}
      {DRIVE_Z.flatMap((z) => side.map((s) => wheel(`dw${z}${s}`, s * 1.02, DRIVE_AXLE_Y, z, DRIVE_R)))}
      {/* pony truck */}
      {side.map((s) => wheel(`pw${s}`, s * 0.95, RAIL_TOP + SMALL_R, 3.05, SMALL_R))}
      {/* trailing */}
      {side.map((s) => wheel(`tw${s}`, s * 0.95, RAIL_TOP + SMALL_R, -2.75, SMALL_R))}

      {/* coupling rods (translate in a circle with the crank) */}
      {side.map((s) => (
        <group
          key={`rod${s}`}
          ref={(g) => {
            if (g && !coupling.current.find((c) => c.mesh === g)) coupling.current.push({ mesh: g, side: s });
          }}
          position={[s * 1.15, DRIVE_AXLE_Y, 0]}
        >
          <mesh material={mats.steel} castShadow>
            <boxGeometry args={[0.06, 0.11, 3.7]} />
          </mesh>
          {DRIVE_Z.map((z) => (
            <mesh key={z} material={mats.steel} position={[0.02, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.1, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      {side.map((s) => (
        <mesh
          key={`main${s}`}
          ref={(m) => {
            if (m && !mainRods.current.find((c) => c.mesh === m)) mainRods.current.push({ mesh: m, side: s });
          }}
          material={mats.steel}
          position={[s * 1.22, DRIVE_AXLE_Y, 1]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.12, 1]} />
        </mesh>
      ))}

      {/* rail contact points for sparks */}
      {DRIVE_Z.flatMap((z) =>
        side.map((s) => (
          <object3D
            key={`ct${z}${s}`}
            ref={(o) => {
              if (o && !contacts.current.includes(o)) contacts.current.push(o);
            }}
            position={[s * 0.95, RAIL_TOP, z - 0.3]}
          />
        ))
      )}

      {/* ── front end ── */}
      <mesh material={mats.red} position={[0, 1.15, 4.5]} castShadow>
        <boxGeometry args={[2.7, 0.42, 0.22]} />
      </mesh>
      {side.map((s) => (
        <group key={`buf${s}`} position={[s * 0.88, 1.15, 4.75]}>
          <mesh material={mats.steel} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.35, 12]} />
          </mesh>
          <mesh material={mats.steel} position={[0, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.04, 20]} />
          </mesh>
        </group>
      ))}
      <mesh material={mats.red} geometry={geo.pilot} position={[0, 0.0, 4.6]} castShadow />

      {/* ── tender ── */}
      <group position={[0, 0, -4.95]}>
        <mesh material={mats.black} position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[2.55, 1.7, 2.9]} />
        </mesh>
        <mesh material={mats.red} position={[0, 1.2, 0]}>
          <boxGeometry args={[2.6, 0.1, 2.95]} />
        </mesh>
        <mesh material={mats.dark} position={[0, 2.9, 0.1]} scale={[1.1, 0.35, 1.2]}>
          <sphereGeometry args={[1.05, 20, 12]} />
        </mesh>
        <mesh material={mats.dark} position={[0, 0.95, 0]}>
          <boxGeometry args={[1.8, 0.3, 2.7]} />
        </mesh>
        {[-0.95, 0, 0.95].flatMap((z) => side.map((s) => wheel(`tdw${z}${s}`, s * 0.95, RAIL_TOP + SMALL_R, z, SMALL_R)))}
      </group>

      {/* ── coach ── */}
      <group position={[0, 0, -10.9]}>
        <mesh material={mats.coach} position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[2.6, 2.3, 8.2]} />
        </mesh>
        <mesh material={mats.dark} position={[0, 3.45, 0]} scale={[1, 1, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.42, 1.42, 8.4, 28, 1, false]} />
        </mesh>
        <mesh material={mats.brass} position={[0, 1.55, 0]}>
          <boxGeometry args={[2.64, 0.05, 8.22]} />
        </mesh>
        {side.map((s) =>
          Array.from({ length: 8 }, (_, i) => (
            <mesh key={`cw${s}${i}`} material={mats.glass} position={[s * 1.31, 2.65, -3.4 + i * 0.97]}>
              <boxGeometry args={[0.02, 0.62, 0.62]} />
            </mesh>
          ))
        )}
        <mesh material={mats.dark} position={[0, 0.95, 0]}>
          <boxGeometry args={[1.9, 0.3, 7.6]} />
        </mesh>
        {[-3.2, -2.4, 2.4, 3.2].flatMap((z) => side.map((s) => wheel(`cwh${z}${s}`, s * 0.95, RAIL_TOP + SMALL_R, z, SMALL_R)))}
      </group>
    </group>
  );
}

/** Advance wheels and rods for a distance travelled (in world units). */
export function driveRig(rig: LocoRig, distance: number) {
  rig.angle += distance / DRIVE_R;
  const a = rig.angle;
  for (const w of rig.wheels) {
    w.mesh.rotation.x = a * (DRIVE_R / w.radius);
  }
  const cy = Math.cos(a) * CRANK;
  const cz = Math.sin(a) * CRANK;
  for (const c of rig.couplingRods) {
    c.mesh.position.y = DRIVE_AXLE_Y + cy * c.side;
    c.mesh.position.z = cz * c.side;
  }
  // main rod: crosshead (slides on the guide) -> crank pin on the leading driver
  for (const m of rig.mainRods) {
    const py = DRIVE_AXLE_Y + cy * m.side;
    const pz = DRIVE_Z[0] + cz * m.side;
    const hy = 1.05;
    const hz = 2.55 + cz * m.side * 0.9;
    const dy = py - hy;
    const dz = pz - hz;
    const len = Math.hypot(dy, dz);
    m.mesh.position.set(m.mesh.position.x, (py + hy) / 2, (pz + hz) / 2);
    m.mesh.scale.z = len;
    m.mesh.rotation.x = Math.atan2(-dy, dz);
  }
}

export const LOCO_FRONT_Z = 5.45;
