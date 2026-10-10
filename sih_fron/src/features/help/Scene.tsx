"use client";
import { Float } from "@react-three/drei";
import { decorationValue } from "@/lib/decoration";

export const RescueItems = () => {
  return (
    <group>
      {/* Floating Lifebuoys (Toruses) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Float
          key={`buoy-${i}`}
          speed={2}
          rotationIntensity={1}
          floatIntensity={2}
          position={[
            (decorationValue(i, 0) - 0.5) * 15,
            (decorationValue(i, 1) - 0.5) * 15,
            (decorationValue(i, 2) - 0.5) * 10 - 2,
          ]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.2, 16, 32]} />
            <meshStandardMaterial color="#FF4444" />
          </mesh>
          {/* White stripes on lifebuoy */}
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.2, 0.25, 0.25]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.2, 0.25, 0.25]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </Float>
      ))}

      {/* Floating Medkits (Boxes) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Float
          key={`kit-${i}`}
          speed={1.5}
          rotationIntensity={0.5}
          floatIntensity={1}
          position={[
            (decorationValue(i, 3) - 0.5) * 15,
            (decorationValue(i, 4) - 0.5) * 15,
            (decorationValue(i, 5) - 0.5) * 10 - 2,
          ]}
        >
          <mesh>
            <boxGeometry args={[1, 0.8, 0.3]} />
            <meshStandardMaterial color="white" />
          </mesh>
          {/* Red Cross */}
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[0.2, 0.6, 0.05]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[0.6, 0.2, 0.05]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </Float>
      ))}
    </group>
  );
};
