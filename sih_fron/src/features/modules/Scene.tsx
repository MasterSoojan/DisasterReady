"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useFrame } from "@react-three/fiber";
import { Float, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { decorationValue } from "@/lib/decoration";

// --- 3D ICONS & INTERACTIVE ITEMS ---

// 🔥 Interactive Flammable Box
const FlammableBox = (props: React.ComponentProps<"group">) => {
  const [burning, setBurning] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (burning && meshRef.current) {
      // Shake and pulse effect when burning
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 15) * 0.1,
      );
    }
  });

  return (
    <group
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        setBurning(true);
      }}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={burning ? "#ff4500" : "#8B4513"} />
      </mesh>
      {burning && (
        <Html
          position={[0, 1.2, 0]}
          transform
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span aria-hidden="true" style={{ fontSize: 32 }}>
            🔥
          </span>
        </Html>
      )}
      {!burning && (
        <Html
          position={[0, 0, 0.6]}
          transform
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <span aria-hidden="true" style={{ color: "#deb887", fontSize: 8 }}>
            Touch Me
          </span>
        </Html>
      )}
    </group>
  );
};

// 🧯 Fire Extinguisher
const FireExtinguisher = (props: React.ComponentProps<"group">) => (
  <group {...props}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.1, 0.3, 0.2, 32]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0.15, 0.6, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.1, 0.3, 0.05]} />
      <meshStandardMaterial color="#888" />
    </mesh>
    <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, 0.5]}>
      <cylinderGeometry args={[0.04, 0.04, 0.4]} />
      <meshStandardMaterial color="black" />
    </mesh>
  </group>
);

// 🚑 First Aid Kit
const MedicalKit = (props: React.ComponentProps<"group">) => (
  <group {...props}>
    <mesh>
      <boxGeometry args={[1, 0.8, 0.3]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <torusGeometry args={[0.15, 0.05, 16, 32]} />
      <meshStandardMaterial color="#ccc" />
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <boxGeometry args={[0.15, 0.4, 0.01]} />
      <meshStandardMaterial color="red" />
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <boxGeometry args={[0.4, 0.15, 0.01]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </group>
);

// ⚓ Life Buoy
const LifeBuoy = (props: React.ComponentProps<"group">) => (
  <group {...props} rotation={[Math.PI / 2, 0, 0]}>
    <mesh>
      <torusGeometry args={[0.6, 0.2, 16, 32]} />
      <meshStandardMaterial color="white" />
    </mesh>
    {[0, 90, 180, 270].map((deg, i) => (
      <mesh key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
        <boxGeometry args={[0.3, 1.3, 0.3]} />
        <meshStandardMaterial color="red" />
      </mesh>
    ))}
  </group>
);

// 🔦 Flashlight
const Flashlight = (props: React.ComponentProps<"group">) => (
  <group {...props} rotation={[0, 0, Math.PI / 4]}>
    <mesh position={[0, -0.3, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.8, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.25, 0.15, 0.4, 32]} />
      <meshStandardMaterial color="black" />
    </mesh>
    <mesh position={[0, 0.51, 0]}>
      <circleGeometry args={[0.2]} />
      <meshStandardMaterial
        color="white"
        emissive="white"
        emissiveIntensity={2}
      />
    </mesh>
  </group>
);

// --- SCENE MANAGER ---
export const ModuleScene = ({
  activeModule,
  darkMode,
}: {
  activeModule: string | null;
  darkMode: boolean;
}) => {
  if (!activeModule) {
    return (
      <>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        {Array.from({ length: 15 }).map((_, i) => (
          <Float
            key={i}
            speed={1}
            rotationIntensity={1}
            floatIntensity={1}
            position={[
              (decorationValue(i, 0) - 0.5) * 20,
              (decorationValue(i, 1) - 0.5) * 20,
              -5,
            ]}
          >
            <mesh>
              <dodecahedronGeometry args={[0.6]} />
              <meshStandardMaterial
                color={darkMode ? "#555" : "#e0f2fe"}
                wireframe
              />
            </mesh>
          </Float>
        ))}
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade />

      {/* Generate 12 floating instances */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={2}
          floatIntensity={2}
          position={[
            (decorationValue(i, 2) - 0.5) * 15,
            (decorationValue(i, 3) - 0.5) * 15,
            (decorationValue(i, 4) - 0.5) * 5 - 2,
          ]}
        >
          {/* Specific Logic for Fire Module to mix Extinguishers and Flammable Boxes */}
          {activeModule === "fire" ? (
            i % 2 === 0 ? (
              <FireExtinguisher scale={0.8} />
            ) : (
              <FlammableBox scale={0.7} />
            )
          ) : (
            <>
              {activeModule === "flood" && <LifeBuoy scale={0.7} />}
              {activeModule === "earthquake" && <MedicalKit scale={0.6} />}
              {activeModule === "cyclone" && <Flashlight scale={0.8} />}
            </>
          )}
        </Float>
      ))}
    </>
  );
};

// --- CONFETTI COMPONENT (Simple CSS Implementation) ---
export const ModuleConfetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -100, x: `${decorationValue(i, 5) * 100}vw`, rotate: 0 }}
        animate={{ y: "110vh", rotate: 360 }}
        transition={{
          duration: decorationValue(i, 6) * 2 + 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-3 h-3 rounded-full"
        style={{
          backgroundColor: ["#FFD700", "#FF6347", "#4169E1", "#32CD32"][
            Math.floor(decorationValue(i, 7) * 4)
          ],
          left: 0,
        }}
      />
    ))}
  </div>
);
