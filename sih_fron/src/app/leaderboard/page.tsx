"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiArrowLeft, FiTrendingUp, FiPrinter } from "react-icons/fi";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Text, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// --- TYPES ---
type Student = {
  username: string;
  role: "student" | "teacher";
  totalQuizzes: number;
  averageScore: number;
  improvement: number; // Changed to number for logic
  badges: string[];
  avatarIcon: string; // New field for role icon
};

// --- 3D COMPONENTS ---

// 🏆 Interactive Trophy (Reacts to Mouse)
const Trophy = ({ darkMode }: { darkMode: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { mouse } = useThree(); // Get mouse position (-1 to 1)

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate based on time AND mouse X position (Parallax effect)
      meshRef.current.rotation.y = (state.clock.elapsedTime * 0.5) + (mouse.x * 0.5);
      // Tilt slightly based on mouse Y
      meshRef.current.rotation.x = 0.2 + (mouse.y * 0.2);
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
        <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 0.5, 1.8, 32]} />
        <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* 3D Label */}
      <Text position={[0, 2.2, 0]} fontSize={0.5} color={darkMode ? "white" : "#1e3a8a"}>
        Top Class
      </Text>
    </group>
  );
};

// Floating Shapes Background
const FloatingShapes = ({ count, darkMode }: { count: number, darkMode: boolean }) => {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2} position={[
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10 - 5
        ]}>
          <mesh>
            {i % 2 === 0 ? <icosahedronGeometry args={[0.4, 0]} /> : <torusGeometry args={[0.3, 0.1, 16, 16]} />}
            <meshStandardMaterial 
              color={darkMode ? ["#FBBF24", "#60A5FA", "#F472B6"][i % 3] : ["#F59E0B", "#3B82F6", "#DB2777"][i % 3]} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// --- HELPER: Random Avatars ---
const getSafetyAvatar = (index: number) => {
    const icons = ["👨‍🚒", "👩‍⚕️", "👮‍♂️", "👷‍♀️", "🦸‍♂️", "🕵️‍♀️", "🧑‍✈️", "🧜‍♀️"]; 
    return icons[index % icons.length];
};

// --- MAIN PAGE ---
export default function Leaderboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Theme Sync
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);

    // Auth Check
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/account");
      return;
    }
    const user = JSON.parse(currentUser);
    if (user.role !== "teacher") {
      router.push("/account");
      return;
    }
    setTeacher(user);

    // Mock Data Generation
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const allStudents = users.filter((u: any) => u.role === "student");

    // Enhance students with stats and avatars
    const studentsWithStats = allStudents.map((s: any, index: number) => ({
      username: s.username,
      role: s.role,
      totalQuizzes: s.totalQuizzes ?? Math.floor(Math.random() * 20 + 5),
      averageScore: s.averageScore ?? Math.floor(Math.random() * 40 + 60), // Score 60-100
      improvement: s.improvement ?? Math.floor(Math.random() * 25), // 0-25% improvement
      badges: s.badges ?? ["Rookie"],
      avatarIcon: getSafetyAvatar(index),
    }));

    // Sort by Score (Desc)
    studentsWithStats.sort((a: Student, b: Student) => b.averageScore - a.averageScore);
    setStudents(studentsWithStats);
  }, [router]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/account");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900"
    }`}>
      
      {/* --- 3D BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
          <Stars radius={100} depth={50} count={3000} factor={4} fade />
          <Sparkles count={80} scale={12} size={4} speed={0.4} opacity={0.5} color="yellow" />
          <Trophy darkMode={darkMode} />
          <FloatingShapes count={15} darkMode={darkMode} />
        </Canvas>
      </div>

      {/* --- UI CONTENT --- */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* --- FULL NAVBAR --- */}
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`rounded-b-3xl shadow-xl sticky top-0 z-50 mx-4 mt-2 ${
            darkMode
                ? 'bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.jpg" alt="logo" className="w-12 h-12 md:w-16 md:h-16 mix-blend-multiply rounded-full" />
                <span className={`text-xl md:text-3xl font-extrabold ${darkMode ? 'text-yellow-300' : 'text-white'}`}>
                    DisasterReady
                </span>
            </Link>
            <div className="flex items-center space-x-1 md:space-x-3 text-xs md:text-base">
                {['leaderboard', 'modules', 'drills', 'account', 'games', 'chat', 'help'].map((page) => (
                <Link
                    key={page}
                    href={`/${page}`}
                    className={`hidden lg:block px-3 py-1 md:px-4 md:py-2 rounded-full font-semibold transition duration-300 ${
                    darkMode
                        ? 'text-gray-200 hover:bg-indigo-700 hover:text-yellow-300'
                        : 'text-white hover:bg-white hover:text-purple-600'
                    }`}
                >
                    {page.charAt(0).toUpperCase() + page.slice(1)}
                </Link>
                ))}
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
                    {darkMode ? <FiSun size={20} color="#FFD700" /> : <FiMoon size={20} color="#fff" />}
                </button>
            </div>
            </div>
        </motion.nav>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            
            {/* Header + Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="mb-4 md:mb-0">
                     <button
                        onClick={() => router.back()}
                        className={`mb-4 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
                            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-indigo-600 hover:bg-blue-50 shadow-sm"
                        }`}
                    >
                        <FiArrowLeft /> Back
                    </button>
                    <h1 className={`text-4xl md:text-6xl font-black drop-shadow-md ${darkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500" : "text-indigo-800"}`}>
                        Hall of Fame 🏆
                    </h1>
                    <p className={`text-lg mt-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Celebrating our bravest Safety Cadets!
                    </p>
                </div>
                <button onClick={handlePrint} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <FiPrinter /> Print Report
                </button>
            </div>

            {/* --- PODIUM (TOP 3) --- */}
            <div className="flex justify-center items-end gap-2 md:gap-8 mb-16 h-64 md:h-72">
                {/* 🥈 2nd Place */}
                {students[1] && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                        className={`relative w-28 md:w-40 h-40 md:h-48 rounded-t-2xl flex flex-col items-center pt-8 border-t-4 border-gray-400 shadow-xl ${darkMode ? "bg-slate-800/80" : "bg-white/80"}`}
                    >
                        <div className="absolute -top-10 w-16 h-16 rounded-full bg-gray-200 border-4 border-gray-400 flex items-center justify-center text-3xl shadow-lg">
                            {students[1].avatarIcon}
                        </div>
                        <div className="absolute -top-3 right-2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">#2</div>
                        <span className="mt-4 font-bold text-center truncate w-full px-2">{students[1].username}</span>
                        <span className="text-sm opacity-70">{students[1].averageScore} Pts</span>
                    </motion.div>
                )}

                {/* 🥇 1st Place (Bigger) */}
                {students[0] && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                        className={`relative w-36 md:w-52 h-56 md:h-64 rounded-t-2xl flex flex-col items-center pt-10 border-t-4 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.4)] ${darkMode ? "bg-yellow-900/60" : "bg-yellow-50/90"}`}
                    >
                         <div className="absolute -top-12 w-20 h-20 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                            {students[0].avatarIcon}
                        </div>
                        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 text-4xl">👑</div>
                        <span className="mt-6 font-black text-xl text-center truncate w-full px-2 text-yellow-600 dark:text-yellow-400">{students[0].username}</span>
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mt-2">
                            {students[0].averageScore} Points
                        </span>
                    </motion.div>
                )}

                {/* 🥉 3rd Place */}
                {students[2] && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                        className={`relative w-28 md:w-40 h-32 md:h-36 rounded-t-2xl flex flex-col items-center pt-8 border-t-4 border-orange-400 shadow-xl ${darkMode ? "bg-orange-900/40" : "bg-orange-50/80"}`}
                    >
                         <div className="absolute -top-10 w-16 h-16 rounded-full bg-orange-200 border-4 border-orange-400 flex items-center justify-center text-3xl shadow-lg">
                            {students[2].avatarIcon}
                        </div>
                        <div className="absolute -top-3 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">#3</div>
                        <span className="mt-4 font-bold text-center truncate w-full px-2">{students[2].username}</span>
                        <span className="text-sm opacity-70">{students[2].averageScore} Pts</span>
                    </motion.div>
                )}
            </div>

            {/* --- LEADERBOARD TABLE --- */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border ${
                    darkMode ? "bg-gray-900/60 border-gray-700" : "bg-white/60 border-white"
                }`}
            >
                <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className={darkMode ? "bg-gray-800/80 text-gray-200" : "bg-indigo-600/90 text-white"}>
                    <tr>
                        <th className="px-6 py-5 text-left text-lg">Rank</th>
                        <th className="px-6 py-5 text-left text-lg">Safety Cadet</th>
                        <th className="px-6 py-5 text-center text-lg">Quizzes</th>
                        <th className="px-6 py-5 text-center text-lg">Score</th>
                        <th className="px-6 py-5 text-center text-lg">Streak</th>
                        <th className="px-6 py-5 text-center text-lg">Badges</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student, index) => (
                        <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`transition-colors duration-300 ${
                                index === 0 ? (darkMode ? "bg-yellow-900/20" : "bg-yellow-50") :
                                index === 1 ? (darkMode ? "bg-gray-800/40" : "bg-gray-50") :
                                index === 2 ? (darkMode ? "bg-orange-900/20" : "bg-orange-50") : 
                                (darkMode ? "hover:bg-gray-800/50" : "hover:bg-blue-50/50")
                            }`}
                        >
                            <td className="px-6 py-4 font-bold text-xl opacity-70">
                                #{index + 1}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-current flex items-center justify-center text-2xl shadow-sm">
                                        {student.avatarIcon}
                                    </div>
                                    <span className="font-bold text-lg">{student.username}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold opacity-80">
                                {student.totalQuizzes}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    student.averageScore >= 90 ? "bg-green-100 text-green-700" :
                                    student.averageScore >= 70 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {student.averageScore}%
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                                <div className="flex items-center justify-center gap-1">
                                    {/* 🔥 Fire Animation for good improvement */}
                                    {student.improvement > 10 && (
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                            🔥
                                        </motion.div>
                                    )}
                                    <span className={student.improvement > 10 ? "text-orange-500 font-bold" : "opacity-60"}>
                                        +{student.improvement}%
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-1 flex-wrap">
                                    {student.badges?.map((badge, i) => (
                                        <span key={i} className="text-xl grayscale hover:grayscale-0 transition cursor-help" title={badge}>
                                            {badge === "Rookie" ? "🔰" : "🌟"}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </motion.div>

            <div className="text-center mt-12 relative z-20 pb-10">
                <button
                    onClick={handleLogout}
                    className="px-10 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-xl transform hover:scale-105 transition"
                >
                    Log Out
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}