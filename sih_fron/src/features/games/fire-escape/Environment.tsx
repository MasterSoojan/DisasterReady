"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, CameraShake, Float } from "@react-three/drei";
import { OptionalCloud as Cloud } from "@/features/learning/OptionalCloud";
import * as THREE from "three";

export const FireEnvironment = ({
  health,
  visibility,
}: {
  health: number;
  visibility: number;
}) => {
  // Convert stats to visual parameters
  const dangerLevel = (100 - health) / 100; // 0 (safe) to 1 (dead)
  const smokeDensity = (100 - visibility) / 100; // 0 (clear) to 1 (blind)

  // Refs for animation
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Flicker effect for fire
      lightRef.current.intensity =
        2 + Math.sin(state.clock.elapsedTime * 10) * 1 + dangerLevel * 2;
    }
  });

  // Calculate colors based on health
  const bgColors = {
    safe: new THREE.Color("#1a0505"),
    danger: new THREE.Color("#450a0a"),
  };
  const currentColor = bgColors.safe.lerp(bgColors.danger, dangerLevel);

  return (
    <>
      <color attach="background" args={[currentColor]} />

      {/* Dynamic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight
        ref={lightRef}
        position={[0, -2, 5]}
        color="#ff4500"
        distance={20}
        decay={2}
      />

      {/* Embers (Always present, increasing with danger) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles
          count={50 + dangerLevel * 200}
          scale={10}
          size={4 + dangerLevel * 4}
          speed={0.4}
          opacity={0.8}
          color={dangerLevel > 0.5 ? "#ffaa00" : "#ff4500"}
          position={[0, 0, -5]}
        />
      </Float>

      {/* Smoke Clouds - Reacts to Visibility */}
      <group position={[0, -2, -5]}>
        {/* Base smoke */}
        <Cloud
          opacity={0.3 + smokeDensity * 0.5}
          speed={0.4}
          bounds={[10, 1, 1.5]}
          segments={20}
          color={smokeDensity > 0.6 ? "#111111" : "#2a2a2a"}
        />

        {/* Intrusive smoke (appears when visibility drops) */}
        {smokeDensity > 0.3 && (
          <Cloud
            opacity={smokeDensity}
            speed={0.8}
            bounds={[5, 1, 2]}
            segments={10}
            position={[0, 1, 3]} // Closer to camera
            color="#000000"
          />
        )}
      </group>

      {/* Camera Shake - Reacts to Health */}
      <CameraShake
        maxYaw={0.02 + dangerLevel * 0.05}
        maxPitch={0.02 + dangerLevel * 0.05}
        maxRoll={0.02 + dangerLevel * 0.05}
        yawFrequency={0.2 + dangerLevel}
        pitchFrequency={0.2 + dangerLevel}
        rollFrequency={0.2 + dangerLevel}
        intensity={1}
      />
    </>
  );
};
