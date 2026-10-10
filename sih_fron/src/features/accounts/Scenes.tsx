"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Stars,
  Sparkles,
  Icosahedron,
  TorusKnot,
  MeshDistortMaterial,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { decorationValue } from "@/lib/decoration";
/* ---------- 3D BACKGROUND: COMMAND CENTER ---------- */
export const DashboardScene = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <group>
      {/* Floating Data Crystals */}
      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={2}
        position={[-4, 2, -2]}
      >
        <Icosahedron args={[1, 0]}>
          <MeshDistortMaterial
            color={darkMode ? "#818cf8" : "#6366f1"}
            speed={2}
            distort={0.3}
            radius={1}
          />
        </Icosahedron>
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={1.5}
        floatIntensity={1}
        position={[4, -2, -3]}
      >
        <TorusKnot args={[0.8, 0.3, 100, 16]}>
          <meshStandardMaterial
            color={darkMode ? "#f472b6" : "#ec4899"}
            roughness={0.1}
            metalness={0.6}
          />
        </TorusKnot>
      </Float>

      <Stars radius={100} depth={50} count={3000} factor={4} fade />
      <Sparkles
        count={50}
        scale={10}
        size={4}
        speed={0.4}
        opacity={0.5}
        color={darkMode ? "cyan" : "purple"}
      />
    </group>
  );
};

// --- 3D COMPONENTS ---

// 🏆 Interactive Trophy (Reacts to Mouse)
export const Trophy = ({ darkMode }: { darkMode: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { mouse } = useThree(); // Get mouse position (-1 to 1)

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate based on time AND mouse X position (Parallax effect)
      meshRef.current.rotation.y =
        state.clock.elapsedTime * 0.5 + mouse.x * 0.5;
      // Tilt slightly based on mouse Y
      meshRef.current.rotation.x = 0.2 + mouse.y * 0.2;
    }
  });

  const goldColor = darkMode ? "#FFD700" : "#F59E0B";

  return (
    <group ref={meshRef} position={[3, 0, 0]} rotation={[0.2, -0.5, 0]}>
      {/* Trophy Geometry */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.5, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
        <meshStandardMaterial
          color={goldColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 0.5, 1.8, 32]} />
        <meshStandardMaterial
          color={goldColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.8, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={goldColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={goldColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 3D Label */}
      <Html
        position={[0, 2.2, 0]}
        transform
        center
        zIndexRange={[0, 0]}
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <span
          aria-hidden="true"
          style={{ fontSize: 18, color: darkMode ? "white" : "#1e3a8a" }}
        >
          Demo records
        </span>
      </Html>
    </group>
  );
};

// Floating Shapes Background
export const FloatingShapes = ({
  count,
  darkMode,
}: {
  count: number;
  darkMode: boolean;
}) => {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
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
          <mesh>
            {i % 2 === 0 ? (
              <icosahedronGeometry args={[0.4, 0]} />
            ) : (
              <torusGeometry args={[0.3, 0.1, 16, 16]} />
            )}
            <meshStandardMaterial
              color={
                darkMode
                  ? ["#FBBF24", "#60A5FA", "#F472B6"][i % 3]
                  : ["#F59E0B", "#3B82F6", "#DB2777"][i % 3]
              }
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};
