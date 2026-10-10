"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTextureSource } from "@/features/learning/textureSource";

export const CharacterDisplay = ({ isTyping }: { isTyping: boolean }) => {
  const source = useTextureSource("/robot-girl.png");
  return source ? <CharacterMesh isTyping={isTyping} source={source} /> : null;
};

const CharacterMesh = ({
  isTyping,
  source,
}: {
  isTyping: boolean;
  source: string;
}) => {
  const group = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const texture = useTexture(source);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = -0.5 + Math.sin(t * 1) * 0.1;
      if (isTyping) {
        group.current.scale.setScalar(1 + Math.sin(t * 10) * 0.02);
      } else {
        group.current.scale.setScalar(1);
      }
    }

    if (auraRef.current) {
      // Subtle blue energy pulse
      auraRef.current.scale.setScalar(1.1 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <group ref={group}>
      {/* 1. CHARACTER SPRITE */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[0, 0, 0.5]}>
          <planeGeometry args={[4, 5]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            toneMapped={false}
          />
        </mesh>
      </Float>

      {/* 2. POINT LIGHTS (Full Coverage Blue Lighting) */}
      <pointLight position={[-3, 2, 2]} intensity={5} color="#1e40af" />
      <pointLight position={[3, 2, 2]} intensity={5} color="#3b82f6" />
      <pointLight position={[-3, -2, 2]} intensity={4} color="#2563eb" />
      <pointLight position={[3, -2, 2]} intensity={4} color="#1d4ed8" />
      <pointLight position={[0, 0, -1]} intensity={6} color="#0000ff" />

      {/* 3. BLUE SPARKLES */}
      <Sparkles
        count={100}
        scale={6}
        size={4}
        speed={0.8}
        opacity={1}
        color="#3b82f6"
      />

      {/* 4. DEEP BLUE AURA GLOW (No White) */}
      <mesh ref={auraRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
              `
                    vec2 uv = vUv - 0.5;
                    float dist = length(uv);
                    // Strictly Blue Gradient
                    float alpha = smoothstep(0.5, 0.0, dist);
                    gl_FragColor = vec4( vec3(0.0, 0.2, 0.8) * alpha, alpha * 0.7 );
                    `,
            );
          }}
        />
      </mesh>
    </group>
  );
};
