"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiCheckCircle, FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Text } from "@react-three/drei";
import * as THREE from "three";

// --- TYPES ---
type Step = { title: string; description: string; };
type QuizQuestion = { question: string; options: string[]; answer: number; }; // New Quiz Type
type Module = { id: string; name: string; color: string; steps: Step[]; quiz: QuizQuestion; };

// --- DATA ---
const modules: Module[] = [
  {
    id: "earthquake",
    name: "Earthquake Safety",
    color: "bg-amber-600",
    steps: [
      { title: "Drop, Cover, Hold", description: "Drop down, take cover under a sturdy table, and hold on tight!" },
      { title: "Stay Away from Glass", description: "Keep away from windows and heavy furniture that might tip over." },
      { title: "Don't Rush Outside", description: "Stay inside until the shaking stops. It is safer indoors during the quake." },
    ],
    quiz: {
      question: "What is the first thing you should do when the ground shakes?",
      options: ["Run outside fast", "Drop, Cover, and Hold", "Stand near a window"],
      answer: 1 // Index of correct answer
    }
  },
  {
    id: "fire",
    name: "Fire Safety",
    color: "bg-red-600",
    steps: [
      { title: "Stop, Drop, and Roll", description: "If your clothes catch fire: Stop moving, Drop to the ground, and Roll over." },
      { title: "Crawl Low", description: "Smoke rises up. Stay low to the floor where the air is cleaner." },
      { title: "Don't Hide", description: "Don't hide under beds. Firefighters need to find you quickly!" },
    ],
    quiz: {
      question: "If there is smoke in the room, what should you do?",
      options: ["Crawl low on the floor", "Stand up and run", "Hide in the closet"],
      answer: 0
    }
  },
  {
    id: "flood",
    name: "Flood Safety",
    color: "bg-blue-600",
    steps: [
      { title: "Move to High Ground", description: "If water starts rising, get to the highest floor or a hill nearby." },
      { title: "Turn Off Power", description: "Ask an adult to turn off the main power switch immediately." },
      { title: "Don't Walk in Water", description: "Flood water moves fast and can be dirty. Stay out of it!" },
    ],
    quiz: {
      question: "Why should you avoid walking in flood water?",
      options: ["It is too cold", "It moves fast and can be dirty", "It ruins your shoes"],
      answer: 1
    }
  },
  {
    id: "cyclone",
    name: "Cyclone Safety",
    color: "bg-teal-600",
    steps: [
      { title: "Secure the House", description: "Help parents close windows and bring outdoor toys inside." },
      { title: "Emergency Kit", description: "Make sure you have flashlights, batteries, and water ready." },
      { title: "Stay Indoors", description: "Do not go outside, even if it looks calm. The wind can return suddenly." },
    ],
    quiz: {
      question: "Where should you stay during a cyclone?",
      options: ["On the roof", "In the garden", "Indoors away from windows"],
      answer: 2
    }
  },
];

// --- 3D ICONS & INTERACTIVE ITEMS ---

// 🔥 Interactive Flammable Box
const FlammableBox = (props: any) => {
  const [burning, setBurning] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (burning && meshRef.current) {
      // Shake and pulse effect when burning
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * 0.1);
    }
  });

  return (
    <group {...props} onClick={(e) => { e.stopPropagation(); setBurning(true); }}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={burning ? "#ff4500" : "#8B4513"} />
      </mesh>
      {burning && (
        <Text position={[0, 1.2, 0]} fontSize={1} color="orange" anchorX="center" anchorY="middle">
          🔥
        </Text>
      )}
       {!burning && (
        <Text position={[0, 0, 0.6]} fontSize={0.2} color="#deb887" anchorX="center" anchorY="middle">
          Touch Me
        </Text>
      )}
    </group>
  );
};

// 🧯 Fire Extinguisher
const FireExtinguisher = (props: any) => (
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
const MedicalKit = (props: any) => (
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
const LifeBuoy = (props: any) => (
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
const Flashlight = (props: any) => (
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
      <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
    </mesh>
  </group>
);

// --- SCENE MANAGER ---
const SceneManager = ({ activeModule, darkMode }: { activeModule: string | null, darkMode: boolean }) => {
  if (!activeModule) {
    return (
      <>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        {Array.from({ length: 15 }).map((_, i) => (
          <Float key={i} speed={1} rotationIntensity={1} floatIntensity={1} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, -5]}>
            <mesh>
              <dodecahedronGeometry args={[0.6]} />
              <meshStandardMaterial color={darkMode ? "#555" : "#e0f2fe"} wireframe />
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
            (Math.random() - 0.5) * 15, 
            (Math.random() - 0.5) * 15, 
            (Math.random() - 0.5) * 5 - 2
          ]}
        >
          {/* Specific Logic for Fire Module to mix Extinguishers and Flammable Boxes */}
          {activeModule === "fire" ? (
             i % 2 === 0 ? <FireExtinguisher scale={0.8} /> : <FlammableBox scale={0.7} />
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
const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
                animate={{ y: window.innerHeight + 100, rotate: 360 }}
                transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                    backgroundColor: ['#FFD700', '#FF6347', '#4169E1', '#32CD32'][Math.floor(Math.random() * 4)],
                    left: 0
                }}
            />
        ))}
    </div>
);


// --- MAIN PAGE COMPONENT ---
export default function ModulesPage() {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const handleBack = () => {
    if (selectedModule) {
        setSelectedModule(null);
        setShowQuiz(false);
        setQuizComplete(false);
    } else {
        router.back();
    }
  };

  const startModule = (mod: Module) => {
    setSelectedModule(mod);
    setStepIndex(0);
    setShowQuiz(false);
    setQuizComplete(false);
  };

  const handleNext = () => {
      if (selectedModule && stepIndex < selectedModule.steps.length - 1) {
          setStepIndex(stepIndex + 1);
      } else {
          // Instead of finishing, show Quiz
          setShowQuiz(true);
      }
  };

  const handleQuizAnswer = (index: number) => {
      if (index === selectedModule?.quiz.answer) {
          setQuizComplete(true);
      } else {
          alert("Oops! Try again! 🤔");
      }
  };

  const steps = selectedModule?.steps ?? [];
  const currentStep = steps[stepIndex];
  // Calculate progress: Steps + Quiz
  const totalSteps = steps.length + 1; 
  const currentProgress = showQuiz ? (quizComplete ? totalSteps : steps.length) : stepIndex + 1;
  const progressPercent = (currentProgress / totalSteps) * 100;

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900"
    }`}>
      
      {/* Show Confetti on Success */}
      {quizComplete && <Confetti />}

      {/* --- 3D CANVAS BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <SceneManager activeModule={selectedModule?.id || null} darkMode={darkMode} />
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

        {/* Back Button */}
        <div className="px-6 pt-6 max-w-7xl mx-auto w-full">
            <button
            onClick={handleBack}
            className={`px-4 py-2 rounded-xl font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-2 ${
                darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-blue-50 text-indigo-600"
            }`}
            >
            <FiArrowLeft /> {selectedModule ? "All Modules" : "Back Home"}
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
            
            {!selectedModule ? (
            // --- GRID VIEW ---
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <h1 className={`text-4xl font-black text-center mb-4 ${darkMode ? "text-white" : "text-indigo-900"}`}>
                Choose Your Mission! 🚀
                </h1>
                <p className="text-center mb-10 text-lg opacity-80">Select a disaster to learn how to stay safe.</p>
                <div className="grid gap-6 sm:grid-cols-2">
                {modules.map((mod) => (
                    <motion.div
                    key={mod.id}
                    onClick={() => startModule(mod)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-3xl cursor-pointer shadow-xl border-l-8 transition-all relative overflow-hidden group ${
                        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-400"
                    }`}
                    >
                        <div className={`absolute right-0 top-0 w-24 h-24 opacity-10 rounded-bl-full transition-transform group-hover:scale-150 ${mod.color}`}></div>
                        <h2 className={`text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                            {mod.name}
                        </h2>
                        <p className="opacity-70">Tap to start training!</p>
                    </motion.div>
                ))}
                </div>
            </motion.div>
            ) : (
            // --- MODULE / QUIZ VIEW ---
            <motion.div 
                key="module-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative"
            >
                {/* Badge */}
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full ${selectedModule.color} text-white shadow-lg z-20`}>
                    <h1 className="text-lg font-bold uppercase tracking-wider">{selectedModule.name}</h1>
                </div>

                {/* Card */}
                <div className={`relative overflow-hidden rounded-3xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full ${selectedModule.color}`}
                        />
                    </div>

                    <div className="p-10 text-center min-h-[350px] flex flex-col justify-center items-center">
                        <AnimatePresence mode="wait">
                            {!showQuiz ? (
                                // --- LEARNING STEPS ---
                                <motion.div
                                    key={`step-${stepIndex}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="text-7xl mb-6 block">
                                        {stepIndex === 0 ? "1️⃣" : stepIndex === 1 ? "2️⃣" : "3️⃣"}
                                    </span>
                                    <h2 className={`text-3xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                        {currentStep.title}
                                    </h2>
                                    <p className="text-xl leading-relaxed opacity-90 max-w-lg mx-auto">
                                        {currentStep.description}
                                    </p>
                                </motion.div>
                            ) : !quizComplete ? (
                                // --- QUIZ QUESTION ---
                                <motion.div
                                    key="quiz"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <span className="text-6xl mb-6 block">❓</span>
                                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                        {selectedModule.quiz.question}
                                    </h2>
                                    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                                        {selectedModule.quiz.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuizAnswer(idx)}
                                                className={`p-4 rounded-xl font-semibold border-2 transition-all hover:scale-105 ${
                                                    darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-200 hover:bg-blue-50"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                // --- SUCCESS SCREEN ---
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <span className="text-8xl mb-4 block">🏆</span>
                                    <h2 className={`text-4xl font-black mb-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                                        Awesome Job!
                                    </h2>
                                    <p className="text-lg opacity-80">You are now a safety expert!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Buttons */}
                    <div className={`p-6 bg-opacity-50 flex justify-between items-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                        <button
                            disabled={stepIndex === 0 && !showQuiz}
                            onClick={() => {
                                if (showQuiz) {
                                    setShowQuiz(false);
                                    setQuizComplete(false);
                                } else {
                                    setStepIndex(stepIndex - 1);
                                }
                            }}
                            className={`px-6 py-2 rounded-xl font-bold transition ${
                                stepIndex === 0 && !showQuiz
                                ? "opacity-0 cursor-default" 
                                : darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-200 shadow-sm text-gray-600"
                            }`}
                        >
                            Back
                        </button>

                        {!quizComplete ? (
                             <button
                                onClick={handleNext}
                                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition ${selectedModule.color}`}
                            >
                                {showQuiz ? "Skip Quiz" : stepIndex < steps.length - 1 ? "Next Step" : "Take Quiz"}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setSelectedModule(null);
                                    setShowQuiz(false);
                                    setQuizComplete(false);
                                }}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-green-500 shadow-lg transform hover:scale-105 transition flex items-center gap-2"
                            >
                                Finish <FiCheckCircle />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}