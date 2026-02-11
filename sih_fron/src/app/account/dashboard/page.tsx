"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiEdit, FiCamera, FiSun, FiMoon, FiArrowLeft, FiUser, FiMail, FiAward, FiTrendingUp, FiUsers, FiActivity } from "react-icons/fi";
import { FaTrophy, FaBook, FaRunning, FaGamepad, FaUserCircle } from "react-icons/fa";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sparkles, Icosahedron, TorusKnot, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ---------- TYPES ---------- */
type User = {
  username: string;
  role: "teacher" | "student";
  email?: string;
  avatar?: string;
  totalQuizzes?: number;
  averageScore?: number;
  improvement?: string;
  level?: string;
  badges?: string[];
};

const navLinks = [
    { name: "Leaderboard", href: "/leaderboard", icon: <FaTrophy /> },
    { name: "Modules", href: "/modules", icon: <FaBook /> },
    { name: "Drills", href: "/drills", icon: <FaRunning /> },
    { name: "Games", href: "/games", icon: <FaGamepad /> },
    { name: "Account", href: "/account", icon: <FaUserCircle /> },
];

/* ---------- 3D BACKGROUND: COMMAND CENTER ---------- */
const DashboardScene = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <group>
      {/* Floating Data Crystals */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-4, 2, -2]}>
          <Icosahedron args={[1, 0]}>
              <MeshDistortMaterial color={darkMode ? "#818cf8" : "#6366f1"} speed={2} distort={0.3} radius={1} />
          </Icosahedron>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1} position={[4, -2, -3]}>
          <TorusKnot args={[0.8, 0.3, 100, 16]}>
              <meshStandardMaterial color={darkMode ? "#f472b6" : "#ec4899"} roughness={0.1} metalness={0.6} />
          </TorusKnot>
      </Float>

      <Stars radius={100} depth={50} count={3000} factor={4} fade />
      <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color={darkMode ? "cyan" : "purple"} />
    </group>
  );
};

/* ---------- MAIN COMPONENT ---------- */
export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  });

  /* Theme */
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  /* Load user */
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/account");
      return;
    }

    const u: User = JSON.parse(stored);
    setUser(u);
    setFormData({
      username: u.username,
      email: u.email || "",
      avatarFile: null,
      avatarPreview: u.avatar || "",
    });

    if (u.role === "teacher") {
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const studentUsers = allUsers
        .filter((x: any) => x.role === "student")
        .map((s: any) => ({
          ...s,
          totalQuizzes: s.totalQuizzes ?? Math.floor(Math.random() * 15 + 1),
          averageScore: s.averageScore ?? Math.floor(Math.random() * 101),
          improvement: s.improvement ?? `+${Math.floor(Math.random() * 20)}%`,
        }));
      setStudents(studentUsers);
    }
  }, [router]);

  if (!user) return null;

  const logout = () => {
    localStorage.removeItem("currentUser");
    router.push("/account");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const saveProfile = () => {
    const updatedUser: User = {
      ...user,
      username: formData.username,
      email: formData.email,
      avatar: formData.avatarPreview,
    };

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Update in main user list
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = allUsers.findIndex(
      (u: any) => u.username === user.username && u.role === user.role
    );
    if (idx >= 0) {
      allUsers[idx] = updatedUser;
      localStorage.setItem("users", JSON.stringify(allUsers));
    }

    setShowEdit(false);
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900"
    }`}>
      
      {/* ================= 3D BACKGROUND LAYER ================= */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} intensity={1} />
            <DashboardScene darkMode={darkMode} />
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
                <img src="/logo.jpg" alt="logo" className="w-16 h-16 mix-blend-multiply rounded-full" />
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
        <div className="px-6 pt-6 pointer-events-auto w-full max-w-7xl mx-auto">
            <button
            onClick={() => router.back()}
            className={`px-5 py-2 rounded-xl font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2 ${
                darkMode ? "bg-slate-800 text-gray-100 hover:bg-slate-700" : "bg-white/90 hover:bg-purple-100 text-purple-700"
            }`}
            >
            <FiArrowLeft /> Back
            </button>
        </div>

        {/* ================= DASHBOARD CONTENT ================= */}
        <div className="flex-grow container mx-auto px-4 py-10 max-w-6xl pointer-events-auto">
            
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className={`text-5xl font-black drop-shadow-md mb-2 ${darkMode ? "text-white" : "text-indigo-900"}`}>
                    Command Center
                </h1>
                <p className={`text-xl font-medium ${darkMode ? "text-purple-300" : "text-indigo-600"}`}>
                    Welcome back, {user.role === "teacher" ? "Commander" : "Cadet"} {user.username}!
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* --- LEFT: PROFILE CARD --- */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className={`lg:w-1/3 p-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 flex flex-col items-center text-center ${
                        darkMode ? "bg-gray-800/60" : "bg-white/60"
                    }`}
                >
                    <div className="relative w-40 h-40 mb-6 group">
                        <div className={`w-full h-full rounded-full overflow-hidden border-4 shadow-lg ${darkMode ? "border-purple-500" : "border-pink-500"}`}>
                            {formData.avatarPreview ? (
                                <img src={formData.avatarPreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center text-6xl font-bold text-white ${darkMode ? "bg-purple-600" : "bg-pink-500"}`}>
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setShowEdit(true)}
                            className="absolute bottom-2 right-2 p-3 bg-white text-purple-600 rounded-full shadow-lg hover:scale-110 transition"
                        >
                            <FiCamera />
                        </button>
                    </div>

                    <h2 className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{user.username}</h2>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
                        user.role === "teacher" ? "bg-indigo-500 text-white" : "bg-green-500 text-white"
                    }`}>
                        {user.role}
                    </span>

                    <div className="w-full space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-white/50"}`}>
                            <FiMail className="text-xl opacity-70" />
                            <span className="text-sm truncate">{user.email || "No email linked"}</span>
                        </div>
                        <button 
                            onClick={() => setShowEdit(true)}
                            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:shadow-purple-500/40 transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <FiEdit /> Edit Profile
                        </button>
                        <button 
                            onClick={logout}
                            className="w-full py-3 rounded-xl font-bold text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2"
                        >
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </motion.div>

                {/* --- RIGHT: STATS AREA --- */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="lg:w-2/3 flex flex-col gap-6"
                >
                    {user.role === "student" ? (
                        <>
                            {/* STUDENT STATS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md border border-white/20 ${darkMode ? "bg-indigo-900/40" : "bg-indigo-100/80"}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-indigo-500 rounded-lg text-white"><FiActivity size={24}/></div>
                                        <h3 className="text-lg font-bold">Total Quizzes</h3>
                                    </div>
                                    <p className="text-4xl font-black">{Math.floor(Math.random() * 20)}</p>
                                </div>
                                <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md border border-white/20 ${darkMode ? "bg-purple-900/40" : "bg-purple-100/80"}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-purple-500 rounded-lg text-white"><FiTrendingUp size={24}/></div>
                                        <h3 className="text-lg font-bold">Average Score</h3>
                                    </div>
                                    <p className="text-4xl font-black">88%</p>
                                </div>
                            </div>

                            {/* BADGES SECTION */}
                            <div className={`flex-grow p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-white/20 ${darkMode ? "bg-gray-800/60" : "bg-white/60"}`}>
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiAward className="text-yellow-500"/> Achievements</h3>
                                <div className="flex flex-wrap gap-4">
                                    {["🔥 First Drill", "🧠 Quiz Master", "🌊 Flood Survivor", "🛡️ Guardian"].map((badge, i) => (
                                        <div key={i} className={`px-4 py-2 rounded-full font-bold border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                                            {badge}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* TEACHER VIEW: STUDENT ROSTER */
                        <div className={`flex-grow p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-white/20 h-full overflow-hidden flex flex-col ${darkMode ? "bg-gray-800/60" : "bg-white/60"}`}>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiUsers className="text-cyan-500"/> Student Roster</h3>
                            
                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                {students.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`border-b ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                                                <th className="py-3 px-2">Student</th>
                                                <th className="py-3 px-2 text-center">Quizzes</th>
                                                <th className="py-3 px-2 text-center">Avg Score</th>
                                                <th className="py-3 px-2 text-center">Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {students.map((s, i) => (
                                                <tr key={i} className={`hover:bg-black/5 transition ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                    <td className="py-4 px-2 font-bold flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                                                            {s.username[0]}
                                                        </div>
                                                        {s.username}
                                                    </td>
                                                    <td className="py-4 px-2 text-center">{s.totalQuizzes}</td>
                                                    <td className="py-4 px-2 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                            (s.averageScore || 0) > 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                            {s.averageScore}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 text-center text-green-500 font-bold">{s.improvement}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center opacity-50 py-10">No students found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>

        {/* ================= EDIT MODAL ================= */}
        <AnimatePresence>
            {showEdit && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 opacity-70">Username</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent">
                                    <FiUser />
                                    <input
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-transparent outline-none"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold mb-1 opacity-70">Email</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent">
                                    <FiMail />
                                    <input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent outline-none"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 opacity-70">Avatar</label>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-8 gap-4">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveProfile}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}