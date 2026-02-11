"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Flame, Waves, Activity, Timer, Volume2, VolumeX, Star, ArrowLeft } from "lucide-react";
import { FiSun, FiMoon, FiArrowLeft } from "react-icons/fi";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Float, Cloud } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";

/* ---------- TYPES ---------- */
type Step = { text: string; correct: boolean; hint: string };
type Drill = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: Step[];
  color: string;
  bgSound: string;
  difficulty: number;
};

/* ---------- DATA ---------- */
const drills: Drill[] = [
  {
    id: "fire",
    name: "Operation: Inferno",
    description: "Escape a burning building safely.",
    color: "bg-red-600",
    bgSound: "/sounds/siren.mp3",
    difficulty: 3,
    icon: <Flame className="w-8 h-8 text-white" />,
    steps: [
      { text: "Activate the Fire Alarm", correct: true, hint: "Alert everyone first!" },
      { text: "Use the Elevator", correct: false, hint: "Elevators can trap you!" },
      { text: "Crawl low under smoke", correct: true, hint: "Air is cleaner near the floor." },
      { text: "Check door handles for heat", correct: true, hint: "Fire might be on the other side." },
      { text: "Open windows to breathe", correct: false, hint: "Oxygen feeds the fire!" },
    ],
  },
  {
    id: "earthquake",
    name: "Operation: Tremor",
    description: "Survive a magnitude 8.0 quake.",
    color: "bg-yellow-600",
    bgSound: "/sounds/rumble.mp3",
    difficulty: 2,
    icon: <Activity className="w-8 h-8 text-white" />,
    steps: [
      { text: "Drop, Cover, and Hold On", correct: true, hint: "Protect your head!" },
      { text: "Run outside immediately", correct: false, hint: "Falling glass is dangerous outside." },
      { text: "Stay away from windows", correct: true, hint: "Glass can shatter inward." },
      { text: "Stand in a doorway", correct: false, hint: "Doorways are not stronger anymore." },
      { text: "Wait for shaking to stop", correct: true, hint: "Patience saves lives." },
    ],
  },
  {
    id: "flood",
    name: "Operation: High Tide",
    description: "Evacuate rising floodwaters.",
    color: "bg-blue-600",
    bgSound: "/sounds/water.mp3",
    difficulty: 4,
    icon: <Waves className="w-8 h-8 text-white" />,
    steps: [
      { text: "Move to higher ground", correct: true, hint: "Water flows downhill." },
      { text: "Walk through the water", correct: false, hint: "6 inches of water can knock you down!" },
      { text: "Turn off main power", correct: true, hint: "Prevent electrocution." },
      { text: "Drink tap water", correct: false, hint: "It might be contaminated." },
      { text: "Listen to emergency radio", correct: true, hint: "Stay informed." },
    ],
  },
];

/* ---------- 3D SCENES ---------- */

const EarthquakeScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.x = Math.sin(time * 25) * 0.3; // Violent Shake
      groupRef.current.position.y = Math.cos(time * 20) * 0.1;
      groupRef.current.rotation.z = Math.sin(time * 15) * 0.05;
    }
  });
  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>
      <Float speed={8} rotationIntensity={5} floatIntensity={5}>
         <mesh position={[2, 2, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="#777" /></mesh>
         <mesh position={[-2, 3, 1]}><dodecahedronGeometry args={[0.3]} /><meshStandardMaterial color="#999" /></mesh>
         <mesh position={[0, 4, -2]}><boxGeometry args={[0.2, 0.8, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
      </Float>
    </group>
  );
};

const FireScene = () => {
  return (
    <group>
      <ambientLight intensity={0.2} color="red" />
      <pointLight position={[0, 5, 0]} intensity={3} color="orange" distance={15} decay={2} />
      <fog attach="fog" args={['#220000', 2, 12]} />
      <Sparkles count={300} scale={12} size={15} speed={0.4} opacity={0.6} color="#ff4500" />
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a0505" />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2} position={[(Math.random()-0.5)*8, (Math.random())*5, (Math.random()-0.5)*8]}>
           <Cloud opacity={0.4} speed={0.2} width={2} depth={1} segments={6} color="#333" />
        </Float>
      ))}
    </group>
  );
};

const FloodScene = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
     if (waterRef.current) waterRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime) * 0.3;
  });
  return (
    <group>
      <ambientLight intensity={0.6} color="#88ccff" />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Sparkles count={400} scale={15} size={3} speed={4} opacity={0.5} color="#aaf" noise={1} />
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1e3a8a" opacity={0.85} transparent roughness={0.1} />
      </mesh>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2, -1.8, -2]}><boxGeometry args={[1, 0.1, 2]} /><meshStandardMaterial color="#5c4033" /></mesh>
      </Float>
    </group>
  );
};

const VictoryScene = () => (
    <group>
        <ambientLight intensity={1} />
        <Stars radius={50} count={2000} factor={4} fade />
        <Float speed={4} rotationIntensity={2} floatIntensity={0.5}>
            <group scale={1.8} rotation={[0, Math.PI, 0]}>
                <mesh><cylinderGeometry args={[1.5, 1.5, 0.2, 6]} /><meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} /></mesh>
                <mesh position={[0, 0, 0.15]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.3, 1.2, 0.1]} /><meshStandardMaterial color="white" /></mesh>
                <mesh position={[-0.4, -0.3, 0.15]} rotation={[0, 0, 0.8]}><boxGeometry args={[0.3, 0.6, 0.1]} /><meshStandardMaterial color="white" /></mesh>
            </group>
        </Float>
        <Sparkles count={200} scale={12} size={6} speed={0.5} color="yellow" />
        <Sparkles count={200} scale={10} size={6} speed={0.5} color="cyan" />
    </group>
);

/* ---------- MAIN COMPONENT ---------- */
export default function DrillSimulator() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  
  // Game State
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("Pick a mission!");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  // Audio Refs
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Theme Sync
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Audio Helper
  const playSfx = (type: 'correct' | 'wrong' | 'win') => {
      if (!audioEnabled) return;
      const file = type === 'correct' ? '/sounds/correct.mp3' : type === 'wrong' ? '/sounds/wrong.mp3' : '/sounds/win.mp3';
      const audio = new Audio(file);
      audio.volume = 0.5;
      audio.play().catch(() => {});
  };

  const startDrill = (drill: Drill) => {
      setSelectedDrill(drill);
      setTimeLeft(60);
      setScore(0);
      setSelectedSteps([]);
      setCompleted(false);
      setMascotMessage(`Survive the ${drill.name}! Act fast! 🐶`);
      
      if(audioEnabled) {
          if(bgAudioRef.current) bgAudioRef.current.pause();
          bgAudioRef.current = new Audio(drill.bgSound);
          bgAudioRef.current.loop = true;
          bgAudioRef.current.volume = 0.3;
          bgAudioRef.current.play().catch(() => console.log("Audio file missing"));
      }
  };

  const stopDrill = () => {
      setSelectedDrill(null);
      if(bgAudioRef.current) {
          bgAudioRef.current.pause();
          bgAudioRef.current = null;
      }
  };

  // Back Button Logic
  const handleBack = () => {
    if (selectedDrill) {
        // If in a drill, back button acts as "Abort Mission"
        stopDrill();
    } else {
        // If in menu, back button goes to Previous Page
        router.back();
    }
  };

  useEffect(() => {
      if (!selectedDrill || completed) return;
      const timer = setInterval(() => {
          setTimeLeft((prev) => {
              if (prev <= 1) {
                  clearInterval(timer);
                  setMascotMessage("Time's up! Be faster next time! 🕒");
                  return 0;
              }
              if (prev === 10) setMascotMessage("Hurry! 10 seconds left! 😱");
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, [selectedDrill, completed]);

  const handleStepClick = (index: number, step: Step) => {
      if (selectedSteps.includes(index)) return;

      if (step.correct) {
          playSfx('correct');
          setSelectedSteps([...selectedSteps, index]);
          setScore((prev) => prev + 100);
          setMascotMessage("Good job! Keep going! ✅");
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#4ade80'] });
      } else {
          playSfx('wrong');
          setScore((prev) => Math.max(0, prev - 50));
          setShakeIndex(index);
          setTimeout(() => setShakeIndex(null), 500);
          setMascotMessage(`Oops! ${step.hint} ❌`);
          setTimeLeft((prev) => Math.max(0, prev - 5));
      }
  };

  const handleFinish = () => {
      if(bgAudioRef.current) bgAudioRef.current.pause();
      playSfx('win');
      setCompleted(true);
      setMascotMessage("Mission Accomplished! You are safe! 🏆");
      confetti({ particleCount: 200, spread: 150, origin: { y: 0.6 } });
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
    }`}>
      
      {/* ================= 3D BACKGROUND LAYER ================= */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <Suspense fallback={null}>
                {!selectedDrill && !completed && (
                    <>
                        <ambientLight intensity={0.5} />
                        <Stars />
                        <Float speed={1}><Cloud opacity={0.5} color={darkMode ? "gray" : "white"} /></Float>
                    </>
                )}
                {selectedDrill?.id === 'earthquake' && !completed && <EarthquakeScene />}
                {selectedDrill?.id === 'fire' && !completed && <FireScene />}
                {selectedDrill?.id === 'flood' && !completed && <FloodScene />}
                {completed && <VictoryScene />}
            </Suspense>
        </Canvas>
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        
        {/* --- FULL NAVBAR --- */}
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`rounded-b-3xl shadow-xl sticky top-0 z-50 mx-4 mt-2 pointer-events-auto ${
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
                
                {/* Audio Toggle */}
                <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
                    {audioEnabled ? <Volume2 size={20} color="white" /> : <VolumeX size={20} color="white" />}
                 </button>

                {/* Dark Mode Toggle */}
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
                    {darkMode ? <FiSun size={20} color="#FFD700" /> : <FiMoon size={20} color="#fff" />}
                </button>
            </div>
            </div>
        </motion.nav>

        {/* --- BACK BUTTON --- */}
        <div className="px-6 pt-6 w-full max-w-7xl mx-auto pointer-events-auto">
            <button
                onClick={handleBack}
                className={`px-4 py-2 rounded-xl font-bold shadow-md transition-all hover:scale-105 flex items-center gap-2 ${
                    darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-indigo-600 hover:bg-blue-50"
                }`}
            >
                <FiArrowLeft /> {selectedDrill ? "Abort Mission" : "Back"}
            </button>
        </div>

        {/* Content Container */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto pointer-events-auto">
            
            {/* --- SELECTION MENU --- */}
            {!selectedDrill && !completed && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-center w-full">
                    <h1 className="text-5xl font-black mb-2 drop-shadow-md text-white">Select Mission 🚨</h1>
                    <p className="text-xl mb-10 opacity-80 text-white">Choose a scenario to simulate.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {drills.map((drill) => (
                            <motion.button
                                key={drill.id}
                                onClick={() => startDrill(drill)}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative p-6 rounded-2xl shadow-xl flex flex-col items-start gap-3 border-l-8 transition-all overflow-hidden group ${
                                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-500"
                                }`}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10"></div>
                                <div className="flex justify-between w-full">
                                    <div className={`p-3 rounded-xl ${drill.color} shadow-lg`}>{drill.icon}</div>
                                    <div className="flex gap-1">
                                        {[...Array(drill.difficulty)].map((_, i) => <Star key={i} size={12} fill="orange" stroke="none" />)}
                                    </div>
                                </div>
                                <div className="text-left z-10">
                                    <h2 className="text-xl font-black uppercase tracking-wider">{drill.name}</h2>
                                    <p className="text-sm opacity-70 leading-tight mt-1">{drill.description}</p>
                                </div>
                                <div className="mt-2 text-xs font-mono bg-black/10 px-2 py-1 rounded">PRIORITY: HIGH</div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- ACTIVE DRILL INTERFACE --- */}
            {selectedDrill && !completed && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="w-full max-w-3xl relative">
                    
                    {/* Header Bar */}
                    <div className="flex justify-between items-center mb-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white shadow-lg">
                        <div className="text-xs opacity-70 font-mono">MISSION IN PROGRESS</div>
                        <div className="flex-grow mx-6 flex flex-col justify-center">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span><Timer size={12} className="inline mr-1"/>TIME</span>
                                <span className={timeLeft < 10 ? "text-red-400 animate-pulse" : "text-green-400"}>{timeLeft}s</span>
                            </div>
                            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border border-white/30">
                                <motion.div 
                                    initial={{ width: "100%" }} 
                                    animate={{ width: `${(timeLeft / 60) * 100}%` }} 
                                    className={`h-full ${timeLeft < 20 ? "bg-red-500" : timeLeft < 40 ? "bg-yellow-500" : "bg-green-500"}`}
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs opacity-70">SCORE</div>
                            <div className="text-xl font-black text-yellow-400">{score}</div>
                        </div>
                    </div>

                    {/* Drill Card */}
                    <div className={`p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-white/20 relative overflow-hidden ${darkMode ? "bg-gray-900/80" : "bg-white/90"}`}>
                        
                        {/* 🐶 Mascot */}
                        <div className="absolute -bottom-2 -right-2 md:-right-12 z-20 flex flex-col items-center">
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} key={mascotMessage}
                                className="bg-white text-black text-xs md:text-sm font-bold p-3 rounded-t-2xl rounded-bl-2xl shadow-lg mb-2 max-w-[150px] text-center border-2 border-black"
                            >
                                {mascotMessage}
                            </motion.div>
                            <div className="text-5xl md:text-7xl drop-shadow-xl">🐶</div>
                        </div>

                        <h3 className="text-2xl font-bold mb-6 text-center flex justify-center items-center gap-2">
                             {selectedDrill.icon} <span className={darkMode ? "text-white" : "text-gray-900"}>Execute Safety Steps</span>
                        </h3>
                        
                        <div className="grid gap-3 relative z-10">
                            {selectedDrill.steps.map((step, i) => {
                                const isSelected = selectedSteps.includes(i);
                                const isShaking = shakeIndex === i;

                                return (
                                    <motion.button
                                        key={i}
                                        onClick={() => handleStepClick(i, step)}
                                        disabled={isSelected || timeLeft === 0}
                                        whileTap={{ scale: 0.98 }}
                                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.4 }}
                                        className={`p-4 rounded-xl text-left font-bold border-2 transition-all flex justify-between items-center group ${
                                            isSelected 
                                            ? "border-green-500 bg-green-500 text-white shadow-md cursor-default" 
                                            : darkMode 
                                                ? "border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500" 
                                                : "border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300"
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${isSelected ? "border-white bg-white text-green-600" : "border-gray-400 text-gray-400"}`}>
                                                {i + 1}
                                            </span>
                                            {step.text}
                                        </span>
                                        {isSelected && <ShieldCheck size={24} className="animate-bounce" />}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                             <button 
                                onClick={handleFinish}
                                disabled={selectedSteps.length < 3}
                                className={`w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 ${
                                    selectedSteps.length >= 3 ? "bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-50"
                                }`}
                            >
                                <ShieldCheck /> I AM SAFE (FINISH)
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- VICTORY SCREEN --- */}
            {completed && (
                <motion.div initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} className="text-center relative z-20 max-w-lg w-full">
                    <div className="bg-black/60 backdrop-blur-xl p-10 rounded-3xl border-2 border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.4)]">
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-7xl drop-shadow-2xl">🏆</div>
                        
                        <h1 className="text-5xl font-black text-yellow-400 mb-2 mt-4 drop-shadow-md">SURVIVOR!</h1>
                        <p className="text-xl text-white font-bold mb-6">You handled that like a pro.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/10 p-4 rounded-xl">
                            <div>
                                <div className="text-xs text-gray-300">FINAL SCORE</div>
                                <div className="text-2xl font-bold text-yellow-300">{score}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-300">TIME LEFT</div>
                                <div className="text-2xl font-bold text-green-300">{timeLeft}s</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { setCompleted(false); stopDrill(); }}
                                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Back to Mission Control
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </div>
  );
}