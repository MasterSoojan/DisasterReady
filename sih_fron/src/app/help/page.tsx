"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiArrowLeft, FiMenu, FiX, FiHelpCircle, FiMessageSquare, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaTrophy, FaBook, FaRunning, FaGamepad, FaUserCircle, FaAmbulance, FaFireExtinguisher } from "react-icons/fa";
import { MdLocalPolice } from "react-icons/md";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Sparkles } from "@react-three/drei";

/* ---------- DATA ---------- */
const faqs = [
    { q: "How do I attempt the quiz?", a: "Go to the Games section, select 'Quiz Challenge', and test your knowledge! You earn points for every correct answer." },
    { q: "Where can I see my ranking?", a: "Visit the Leaderboard page. If you are in the Top 3, you'll see your avatar on the victory podium!" },
    { q: "How do I start a Drill?", a: "Go to the Drills page, pick a scenario (Fire, Flood, etc.), and follow the 3D simulation steps carefully." },
    { q: "Can I change my avatar?", a: "Yes! Go to the Account page to customize your profile settings." },
];

/* ---------- 3D COMPONENT: FLOATING RESCUE ITEMS ---------- */
const RescueItems = () => {
  return (
    <group>
      {/* Floating Lifebuoys (Toruses) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Float key={`buoy-${i}`} speed={2} rotationIntensity={1} floatIntensity={2} position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 2
        ]}>
           <mesh rotation={[Math.PI/2, 0, 0]}>
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
        <Float key={`kit-${i}`} speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 2
        ]}>
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

/* ---------- MAIN PAGE ---------- */
export default function HelpPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  /* Theme Sync */
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
    }`}>
      
      {/* ================= 3D BACKGROUND LAYER ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={3000} factor={4} fade />
            <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color={darkMode ? "cyan" : "blue"} />
            <RescueItems />
        </Canvas>
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* ================= NAVBAR (YOUR ORIGINAL STYLE) ================= */}
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

        {/* Back Button */}
        <div className="px-6 pt-6 max-w-7xl mx-auto w-full pointer-events-auto">
            <button
            onClick={() => router.back()}
            className={`px-5 py-2 rounded-xl font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2 ${
                darkMode ? "bg-slate-800 text-gray-100 hover:bg-slate-700" : "bg-white/90 hover:bg-purple-100 text-purple-700"
            }`}
            >
            <FiArrowLeft /> Back
            </button>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-grow container mx-auto px-4 py-10 max-w-5xl pointer-events-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 rounded-full bg-white/20 backdrop-blur-md shadow-lg mb-4">
                    <FiHelpCircle className={`text-6xl ${darkMode ? "text-cyan-400" : "text-blue-600"}`} />
                </motion.div>
                <h1 className={`text-5xl font-black drop-shadow-lg ${darkMode ? "text-white" : "text-indigo-900"}`}>
                    Rescue Center
                </h1>
                <p className={`text-xl mt-2 font-medium ${darkMode ? "text-gray-300" : "text-indigo-600"}`}>
                    Emergency contacts & quick guides.
                </p>
            </div>

            {/* EMERGENCY CARDS (Colorful & Holographic) */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <a href="tel:108" className="group">
                    <motion.div whileHover={{ scale: 1.05, translateY: -5 }} className="relative overflow-hidden rounded-3xl p-6 h-full border border-red-400/30 bg-gradient-to-br from-red-500/90 to-orange-500/90 backdrop-blur-md shadow-xl text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><FaAmbulance size={100} /></div>
                        <h2 className="text-2xl font-black mb-1">AMBULANCE</h2>
                        <p className="text-sm opacity-90 mb-4">Medical Emergency</p>
                        <div className="text-4xl font-mono font-bold tracking-widest bg-black/20 rounded-xl py-2 text-center border border-white/20 group-hover:bg-white group-hover:text-red-600 transition-colors">
                            108
                        </div>
                    </motion.div>
                </a>

                <a href="tel:100" className="group">
                    <motion.div whileHover={{ scale: 1.05, translateY: -5 }} className="relative overflow-hidden rounded-3xl p-6 h-full border border-blue-400/30 bg-gradient-to-br from-blue-600/90 to-cyan-500/90 backdrop-blur-md shadow-xl text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><MdLocalPolice size={100} /></div>
                        <h2 className="text-2xl font-black mb-1">POLICE</h2>
                        <p className="text-sm opacity-90 mb-4">Safety & Rescue</p>
                        <div className="text-4xl font-mono font-bold tracking-widest bg-black/20 rounded-xl py-2 text-center border border-white/20 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            100
                        </div>
                    </motion.div>
                </a>

                <a href="tel:101" className="group">
                    <motion.div whileHover={{ scale: 1.05, translateY: -5 }} className="relative overflow-hidden rounded-3xl p-6 h-full border border-orange-400/30 bg-gradient-to-br from-red-600/90 to-rose-600/90 backdrop-blur-md shadow-xl text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><FaFireExtinguisher size={80} /></div>
                        <h2 className="text-2xl font-black mb-1">FIRE</h2>
                        <p className="text-sm opacity-90 mb-4">Fire & Hazards</p>
                        <div className="text-4xl font-mono font-bold tracking-widest bg-black/20 rounded-xl py-2 text-center border border-white/20 group-hover:bg-white group-hover:text-red-600 transition-colors">
                            101
                        </div>
                    </motion.div>
                </a>
            </div>

            {/* SUPPORT & FAQ GRID */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Contact Box */}
                <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-white/20 ${darkMode ? "bg-gray-800/60" : "bg-white/60"}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500 rounded-full text-white"><FiMessageSquare size={24} /></div>
                        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Need Help?</h2>
                    </div>
                    <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Found a bug or need specific safety advice? Our team is standing by.
                    </p>
                    <Link href="/feedback">
                        <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:shadow-purple-500/40 transform transition hover:scale-[1.02] flex items-center justify-center gap-2">
                            Send Message <FiArrowLeft className="rotate-180" />
                        </button>
                    </Link>
                </div>

                {/* FAQ Accordion */}
                <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-white/20 ${darkMode ? "bg-gray-800/60" : "bg-white/60"}`}>
                    <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        <FiHelpCircle className="text-cyan-500" /> FAQ
                    </h2>
                    
                    <div className="space-y-3">
                        {faqs.map((item, idx) => (
                            <div key={idx} className={`rounded-xl overflow-hidden transition-all duration-300 ${openFAQ === idx ? "bg-white/10 shadow-inner" : "hover:bg-black/5"}`}>
                                <button
                                    onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                                    className={`w-full flex justify-between items-center p-4 font-bold text-left ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                                >
                                    {item.q}
                                    {openFAQ === idx ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {openFAQ === idx && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: "auto", opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-4 pb-4 text-sm opacity-80 leading-relaxed"
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};