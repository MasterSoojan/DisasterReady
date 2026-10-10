"use client";
import { useRef, type ComponentProps } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { decorationValue } from "@/lib/decoration";

// 🎮 Floating Retro Controller
export const GameController = (props: ComponentProps<"group">) => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Gentle floating and rotation
      group.current.rotation.y += 0.01;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[3, 1.5, 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.3} />
      </mesh>
      {/* Screen area */}
      <mesh position={[0, 0.2, 0.3]}>
        <planeGeometry args={[1, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Buttons (Red) */}
      <mesh position={[1, 0, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[1.2, 0.3, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {/* D-Pad (Blue) */}
      <mesh position={[-1, 0, 0.3]}>
        <boxGeometry args={[0.6, 0.2, 0.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-1, 0, 0.3]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
};

// Background Floating Objects (Coins/Powerups)
export const FloatingPowerups = () => {
  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={2}
          floatIntensity={2}
          position={[
            (decorationValue(i, 0) - 0.5) * 20,
            (decorationValue(i, 1) - 0.5) * 15,
            (decorationValue(i, 2) - 0.5) * 10 - 5,
          ]}
        >
          {i % 2 === 0 ? (
            // Torus (Ring)
            <mesh>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "cyan" : "magenta"}
                emissive={i % 3 === 0 ? "cyan" : "magenta"}
                emissiveIntensity={0.5}
              />
            </mesh>
          ) : (
            // Icosahedron (Gem)
            <mesh>
              <icosahedronGeometry args={[0.4, 0]} />
              <MeshDistortMaterial color="gold" speed={2} distort={0.3} />
            </mesh>
          )}
        </Float>
      ))}
    </group>
  );
};
