"use client";

import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";

function EmberCore() {
  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.1, 1]} />
          <MeshDistortMaterial
            color="#ff6500"
            emissive="#ff2a00"
            emissiveIntensity={1.4}
            roughness={0.2}
            metalness={0.1}
            distort={0.35}
            speed={1.5}
          />
        </mesh>
      </Float>
      <Sparkles count={80} scale={[10, 6, 6]} size={3} speed={0.5} color="#ffb000" />
      <Stars radius={30} depth={12} count={2000} factor={2} saturation={0} fade speed={0.8} />
    </group>
  );
}

export function SceneBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#050505"]} />
          <ambientLight intensity={1.2} />
          <pointLight position={[0, 0, 2]} intensity={20} color="#ff6500" />
          <EmberCore />
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.7} />
            <Noise opacity={0.08} />
            <Vignette eskil={false} offset={0.2} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
