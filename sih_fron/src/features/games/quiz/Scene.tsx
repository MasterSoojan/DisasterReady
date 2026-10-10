"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import type { Mesh } from "three";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";

// --- 3D COMPONENTS ---

const AnimatedGlobe = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the globe slowly
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} ref={meshRef} scale={2.4}>
        <MeshDistortMaterial
          color="#4c1d95" // Deep purple/blue base
          attach="material"
          distort={0.4} // Wobbly effect resembling changing terrain/water
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      {/* Atmosphere Glow */}
      <Sphere args={[1.2, 64, 64]} scale={2.1}>
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={2} // DoubleSide
        />
      </Sphere>
    </Float>
  );
};

export const QuizScene = () => {
  return (
    <div className="absolute inset-0 -z-10 bg-gray-950">
      <DecorativeCanvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          color="#c084fc"
        />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#3b82f6"
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <AnimatedGlobe />
      </DecorativeCanvas>
    </div>
  );
};
