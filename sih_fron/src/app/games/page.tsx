"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiSun, FiMoon, FiArrowLeft, FiCpu, FiSearch, FiActivity } from "react-icons/fi";
import { FaFire, FaRunning, FaGamepad, FaBrain } from "react-icons/fa"; // Using FontAwesome for game icons
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sparkles, MeshDistortMaterial, Text } from "@react-three/drei";
import * as THREE from "three";

/* ---------- DATA ---------- */
const games = [
  {
    id: "quiz",
    title: "Quiz Challenge",
    description: "Test your brain power!",
    href: "/games/quiz",
    color: "from-purple-500 to-indigo-500",
    icon: <FaBrain className="text-4xl text-white" />,
    difficulty: "Medium",
  },
  {
    id: "spot",
    title: "Spot Finder",
    description: "Find the safe zone fast!",
    href: "/games/SpotFinder",
    color: "from-blue-400 to-cyan-400",
    icon: <FiSearch className="text-4xl text-white" />,
    difficulty: "Easy",
  },
  {
    id: "fire",
    title: "Fire Escape",
    description: "Outrun the smoke!",
    href: "/games/FireEscape",
    color: "from-orange-500 to-red-500",
    icon: <FaFire className="text-4xl text-white" />,
    difficulty: "Hard",
  },
  {
    id: "shake",
    title: "Shake & Survive",
    description: "Don't fall during the quake!",
    href: "/games/ShakeSurvive",
    color: "from-yellow-400 to-orange-400",
    icon: <FiActivity className="text-4xl text-white" />,
    difficulty: "Medium",
  },
  {
    id: "blaze",
    title: "Blaze Escape",
    description: "The floor is lava... almost!",
    href: "/games/BlazeEscape",
    color: "from-red-600 to-rose-600",
    icon: <FaRunning className="text-4xl text-white" />,
    difficulty: "Expert",
  },
];

/* ---------- 3D COMPONENTS ---------- */

// 🎮 Floating Retro Controller
const GameController = (props: any) => {
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
const FloatingPowerups = () => {
  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2} position={[
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10 - 5
        ]}>
           {i % 2 === 0 ? (
               // Torus (Ring)
               <mesh>
                   <torusGeometry args={[0.3, 0.1, 16, 32]} />
                   <meshStandardMaterial color={i % 3 === 0 ? "cyan" : "magenta"} emissive={i % 3 === 0 ? "cyan" : "magenta"} emissiveIntensity={0.5} />
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

/* ---------- 3D TILT CARD COMPONENT ---------- */
const TiltCard = ({ game }: { game: typeof games[0] }) => {
    // Framer Motion 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 200);
        y.set(yPct * 200);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <Link href={game.href}>
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative h-64 w-full rounded-3xl p-6 cursor-pointer shadow-xl transition-shadow hover:shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border-4 border-transparent hover:border-white/50 group`}
            >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 dark:opacity-20 group-hover:opacity-30 transition-opacity`} />
                
                {/* 3D Depth Layer */}
                <div style={{ transform: "translateZ(50px)" }} className="relative z-10 flex flex-col items-center text-center h-full justify-center">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${game.color} shadow-lg mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                        {game.icon}
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{game.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{game.description}</p>
                    
                    <div className="mt-auto pt-4">
                        <span className="px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {game.difficulty}
                        </span>
                    </div>
                </div>

                {/* Decorative Blob */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${game.color} rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`} />
            </motion.div>
        </Link>
    );
};

/* ---------- MAIN PAGE ---------- */
export default function GamesMenuPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  /* Load & save theme */
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900"
    }`}>
      
      {/* ================= 3D BACKGROUND ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
            <Stars radius={100} depth={50} count={3000} factor={4} fade />
            <Sparkles count={100} scale={15} size={5} speed={0.4} opacity={0.5} color={darkMode ? "cyan" : "purple"} />
            
            {/* Floating Controller Icon */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                 <GameController position={[0, 2.5, 0]} rotation={[0.5, 0.5, 0]} scale={0.5} />
            </Float>

            {/* Floating Coins/Gems */}
            <FloatingPowerups />
        </Canvas>
      </div>

      {/* ================= UI CONTENT ================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`rounded-b-3xl shadow-xl sticky top-0 z-50 mx-4 mt-2 ${
            darkMode
                ? "bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800"
                : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.jpg" alt="logo" className="w-12 h-12 md:w-16 md:h-16 mix-blend-multiply rounded-full" />
                <span className={`text-xl md:text-3xl font-extrabold ${darkMode ? "text-yellow-300" : "text-white"}`}>
                    DisasterReady
                </span>
            </Link>

            <div className="flex items-center space-x-3 text-sm md:text-base">
                {["leaderboard", "modules", "drills", "account", "games", "chat", "help"].map((page) => (
                <Link
                    key={page}
                    href={`/${page}`}
                    className={`hidden md:block px-4 py-2 rounded-full font-semibold transition ${
                    darkMode
                        ? "text-gray-200 hover:bg-indigo-700 hover:text-yellow-300"
                        : "text-white hover:bg-white hover:text-purple-600"
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

        {/* Back Button */}
        <div className="px-6 pt-6 max-w-7xl mx-auto w-full">
            <button
            onClick={() => router.back()}
            className={`px-4 py-2 rounded-xl font-bold shadow-md transition-all hover:scale-105 flex items-center gap-2 ${
                darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-indigo-600 hover:bg-blue-50"
            }`}
            >
            <FiArrowLeft /> Back
            </button>
        </div>

        {/* Hero Title */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6 mb-12"
        >
            <div className="inline-block p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl mb-4">
                <FaGamepad className={`text-6xl ${darkMode ? "text-purple-400" : "text-indigo-600"}`} />
            </div>
            <h1 className={`text-5xl md:text-7xl font-black drop-shadow-xl ${darkMode ? "text-white" : "text-gray-900"}`}>
                ARCADE ZONE
            </h1>
            <p className={`text-xl font-medium mt-2 ${darkMode ? "text-purple-200" : "text-indigo-700"}`}>
                Play, Learn, and Earn Badges! 🏆
            </p>
        </motion.div>

        {/* Games Grid */}
        <div className="flex-grow container mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {games.map((game) => (
                    <TiltCard key={game.id} game={game} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}