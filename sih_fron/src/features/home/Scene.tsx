"use client";
import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { OptionalCloud as Cloud } from "@/features/learning/OptionalCloud";
import * as THREE from "three";

// This provides the 3D lighting without needing a visible "dot"
const SceneController = ({ darkMode }: { darkMode: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      // Light follows mouse for subtle depth
      const x = (mouse.x * viewport.width) / 2;
      const y = (mouse.y * viewport.height) / 2;
      lightRef.current.position.set(x, y, 5);
    }
  });

  return (
    <>
      <ambientLight intensity={darkMode ? 0.3 : 0.8} />
      <pointLight
        ref={lightRef}
        intensity={darkMode ? 1 : 2}
        color={darkMode ? "#4f46e5" : "#fbbf24"}
      />
    </>
  );
};

// --- 3D COMPONENT ---
export const WeatherScene = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <>
      <SceneController darkMode={darkMode} />

      {/* Stars only appear in Dark Mode */}
      {darkMode && (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {/* Floating Clouds */}
      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={1}>
          <Cloud
            position={[-8, 0, -10]}
            speed={0.2}
            opacity={darkMode ? 0.3 : 0.6}
            color={darkMode ? "#6b7280" : "white"}
            bounds={[10, 1, 1.5]}
            segments={20}
          />
          <Cloud
            position={[8, 2, -10]}
            speed={0.2}
            opacity={darkMode ? 0.3 : 0.8}
            color={darkMode ? "#4b5563" : "#ecfeff"}
            bounds={[10, 1, 1.5]}
            segments={20}
          />
          <Cloud
            position={[0, -5, -15]}
            speed={0.2}
            opacity={0.5}
            color={darkMode ? "#374151" : "white"}
            bounds={[20, 1, 2]}
            segments={20}
          />
        </Float>
      </Suspense>
    </>
  );
};
