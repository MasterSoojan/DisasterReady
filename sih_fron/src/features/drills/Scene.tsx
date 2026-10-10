"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Float } from "@react-three/drei";
import { OptionalCloud as Cloud } from "@/features/learning/OptionalCloud";
import * as THREE from "three";
import { decorationValue } from "@/lib/decoration";

/* ---------- 3D SCENES ---------- */

export const EarthquakeScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.x = Math.sin(time * 25) * 0.3; // Violent Shake
      groupRef.current.position.y = Math.cos(time * 20) * 0.1;
      groupRef.current.rotation.z = Math.sin(time * 15) * 0.05;
    }
  });
  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>
      <Float speed={8} rotationIntensity={5} floatIntensity={5}>
        <mesh position={[2, 2, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#777" />
        </mesh>
        <mesh position={[-2, 3, 1]}>
          <dodecahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#999" />
        </mesh>
        <mesh position={[0, 4, -2]}>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </Float>
    </group>
  );
};

export const FireScene = () => {
  return (
    <group>
      <ambientLight intensity={0.2} color="red" />
      <pointLight
        position={[0, 5, 0]}
        intensity={3}
        color="orange"
        distance={15}
        decay={2}
      />
      <fog attach="fog" args={["#220000", 2, 12]} />
      <Sparkles
        count={300}
        scale={12}
        size={15}
        speed={0.4}
        opacity={0.6}
        color="#ff4500"
      />
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a0505" />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={1}
          floatIntensity={2}
          position={[
            (decorationValue(i, 0) - 0.5) * 8,
            decorationValue(i, 1) * 5,
            (decorationValue(i, 2) - 0.5) * 8,
          ]}
        >
          <Cloud
            opacity={0.4}
            speed={0.2}
            bounds={[2, 1, 1]}
            segments={6}
            color="#333"
          />
        </Float>
      ))}
    </group>
  );
};

export const FloodScene = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (waterRef.current)
      waterRef.current.position.y =
        -2 + Math.sin(state.clock.elapsedTime) * 0.3;
  });
  return (
    <group>
      <ambientLight intensity={0.6} color="#88ccff" />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Sparkles
        count={400}
        scale={15}
        size={3}
        speed={4}
        opacity={0.5}
        color="#aaf"
        noise={1}
      />
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#1e3a8a"
          opacity={0.85}
          transparent
          roughness={0.1}
        />
      </mesh>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2, -1.8, -2]}>
          <boxGeometry args={[1, 0.1, 2]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
      </Float>
    </group>
  );
};

export const VictoryScene = () => (
  <group>
    <ambientLight intensity={1} />
    <Stars radius={50} count={2000} factor={4} fade />
    <Float speed={4} rotationIntensity={2} floatIntensity={0.5}>
      <group scale={1.8} rotation={[0, Math.PI, 0]}>
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.2, 6]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.15]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.3, 1.2, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.4, -0.3, 0.15]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.3, 0.6, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </Float>
    <Sparkles count={200} scale={12} size={6} speed={0.5} color="yellow" />
    <Sparkles count={200} scale={10} size={6} speed={0.5} color="cyan" />
  </group>
);
