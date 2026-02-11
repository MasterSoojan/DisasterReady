"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiArrowLeft, FiSend } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ---------- 3D COMPONENT: ROBOT GIRL WITH BLUE AURA ---------- */
const CharacterDisplay = ({ isTyping }: { isTyping: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  
  const texture = useTexture("/robot-girl.png"); 

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
        group.current.position.y = -0.5 + Math.sin(t * 1) * 0.1;
        if(isTyping) {
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
                    `
                );
            }}
        />
      </mesh>
    </group>
  );
};

/* ---------- MAIN CHAT PAGE ---------- */
export default function ChatPage() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([
    { sender: "bot", text: "👋 Hi! I'm your Study Buddy! I love learning about safety. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Theme Sync
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "🤖 That's a great question! Scanning my safety logs..." },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
      
      {/* ================= FULL NAVBAR ================= */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`rounded-b-3xl shadow-xl sticky top-0 z-50 pointer-events-auto ${
          darkMode
            ? 'bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800'
            : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 mix-blend-multiply" />
            <span className={`text-3xl font-extrabold ${darkMode ? 'text-yellow-300' : 'text-white'}`}>
              DisasterReady
            </span>
          </Link>

          <div className="flex items-center space-x-3 text-sm md:text-base">
            {['leaderboard', 'modules', 'drills', 'account', 'games', 'chat', 'help'].map((page) => (
              <Link
                key={page}
                href={`/${page}`}
                className={`hidden md:block px-4 py-2 rounded-full font-semibold transition duration-300 ${
                  darkMode
                    ? 'text-gray-200 hover:bg-indigo-700 hover:text-yellow-300'
                    : 'text-white hover:bg-white hover:text-purple-600'
                }`}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </Link>
            ))}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
            >
              {darkMode ? <FiSun size={20} color="#FFD700" /> : <FiMoon size={20} color="#fff" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ================= 3D SCENE ================= */}
      <div className="fixed inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
             <ambientLight intensity={0.2} />
             <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1.5} />
             <group position={[-2.8, 0, 0]}>
                <CharacterDisplay isTyping={isTyping} />
             </group>
         </Canvas>
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="relative z-10 flex flex-col flex-grow pointer-events-none p-6">
        
        <div className="pointer-events-auto">
            <button onClick={() => router.back()} className={`px-5 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2 mb-6 ${darkMode ? "bg-slate-800 text-gray-100" : "bg-white text-purple-700"}`}>
                <FiArrowLeft /> Back
            </button>
        </div>

        <div className="flex-grow flex items-center justify-end">
            <div className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border h-[75vh] ${
                darkMode ? "bg-gray-900/80 border-white/10" : "bg-white/70 border-blue-200"
            } backdrop-blur-xl`}>
                
                {/* Chat Header */}
                <div className="p-5 flex items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
                    <div className="w-12 h-12 rounded-full bg-blue-500/30 border border-white/20 p-1">
                         <img src="/robot-girl.png" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Study Buddy</h2>
                        <div className="flex items-center gap-2 text-xs opacity-80">
                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                            {isTyping ? "Typing..." : "Online"}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm font-medium ${
                                msg.sender === "user" 
                                ? "bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20" 
                                : darkMode ? "bg-gray-800 text-white rounded-bl-none" : "bg-white text-slate-800 rounded-bl-none shadow-sm"
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white/5 border-t border-white/10">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className={`flex-1 px-6 py-3 rounded-full outline-none border transition-all ${
                                darkMode ? "bg-white/5 border-white/10 text-white focus:border-blue-500" : "bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-400"
                            }`}
                            placeholder="Ask a safety question..."
                        />
                        <button onClick={handleSend} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:scale-105">
                            <FiSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}