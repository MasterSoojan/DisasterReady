"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, Home, ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TYPES ---
type Question = {
  question: string;
  options: string[];
  answer: string;
};

// --- DATA ---
const quizData: Question[] = [
  {
    question: "🌍 Which natural disaster is measured using the Richter scale?",
    options: ["Flood", "Earthquake", "Cyclone", "Tsunami"],
    answer: "Earthquake",
  },
  {
    question: "🏛️ What does NDMA stand for?",
    options: [
      "National Disaster Management Authority",
      "National Defence Management Agency",
      "Natural Disaster Monitoring Association",
      "National Data Management Authority",
    ],
    answer: "National Disaster Management Authority",
  },
  {
    question: "🌡️ Which gas is responsible for global warming?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
    answer: "Carbon Dioxide",
  },
  {
    question: "💨 Which instrument is used to measure wind speed?",
    options: ["Thermometer", "Seismograph", "Anemometer", "Barometer"],
    answer: "Anemometer",
  },
  {
    question: "🏠 What should you do during an earthquake?",
    options: [
      "Stand under a tree",
      "Run outside immediately",
      "Take cover under sturdy furniture",
      "Use the elevator",
    ],
    answer: "Take cover under sturdy furniture",
  },
  {
    question: "🌊 Cyclones in the Pacific Ocean are called?",
    options: ["Typhoons", "Hurricanes", "Tornadoes", "Storms"],
    answer: "Typhoons",
  },
  {
    question: "🚑 What is the full form of SDRF?",
    options: [
      "State Disaster Response Force",
      "State Defence Rescue Force",
      "Severe Disaster Relief Fund",
      "Statewide Disaster Relief Force",
    ],
    answer: "State Disaster Response Force",
  },
  {
    question: "☔ Which natural disaster is caused by heavy rainfall and overflow of rivers?",
    options: ["Earthquake", "Flood", "Landslide", "Volcano"],
    answer: "Flood",
  },
  {
    question: "🌀 Which scale measures the intensity of cyclones?",
    options: [
      "Richter Scale",
      "Saffir-Simpson Scale",
      "Beaufort Scale",
      "Mercalli Scale",
    ],
    answer: "Saffir-Simpson Scale",
  },
  {
    question: "🌊 Tsunamis are usually caused by?",
    options: [
      "Volcanic eruptions",
      "Earthquakes under the sea",
      "Heavy rainfall",
      "Landslides",
    ],
    answer: "Earthquakes under the sea",
  },
];

// --- 3D COMPONENTS ---

const AnimatedGlobe = () => {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the globe slowly
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} ref={meshRef} scale={2.4}>
        <MeshDistortMaterial
          color="#4c1d95" // Deep purple/blue base
          attach="material"
          distort={0.4} // Wobbly effect resembling changing terrain/water
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      {/* Atmosphere Glow */}
      <Sphere args={[1.2, 64, 64]} scale={2.1}>
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={2} // DoubleSide
        />
      </Sphere>
    </Float>
  );
};

const BackgroundScene = () => {
  return (
    <div className="absolute inset-0 -z-10 bg-gray-950">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#c084fc" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AnimatedGlobe />
      </Canvas>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(option);

    if (option === quizData[currentQ].answer) {
      setScore(score + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < quizData.length) {
      setCurrentQ(currentQ + 1);
      setFeedback(null);
      setAnswered(false);
      setSelectedOption(null);
    } else {
      setSubmitted(true);
    }
  };

  const handleRetake = () => {
    setCurrentQ(0);
    setScore(0);
    setFeedback(null);
    setSubmitted(false);
    setAnswered(false);
    setSelectedOption(null);
  };

  const averageScore = Math.ceil(quizData.length / 2);
  const progress = ((currentQ + 1) / quizData.length) * 100;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden text-white font-sans">
      {/* 3D Background */}
      <BackgroundScene />

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Header Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Disaster Awareness
          </h1>
          <p className="mt-2 text-purple-200 text-lg font-medium opacity-80">
            Test your knowledge. Save the planet.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="quiz-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl ring-1 ring-white/10"
            >
              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-6 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Question Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold uppercase tracking-widest text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30">
                  Question {currentQ + 1}
                </span>
                <span className="text-sm text-gray-400">
                  {quizData.length - currentQ - 1} Remaining
                </span>
              </div>

              {/* Question Text */}
              <motion.h2
                key={currentQ} // Triggers animation on change
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl md:text-3xl font-bold mb-8 leading-snug text-white"
              >
                {quizData[currentQ].question}
              </motion.h2>

              {/* Options Grid */}
              <div className="grid gap-4">
                {quizData[currentQ].options.map((option, i) => {
                  const isSelected = selectedOption === option;
                  const isCorrectAnswer = option === quizData[currentQ].answer;
                  
                  // Determine Button Styles based on state
                  let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/50";
                  
                  if (answered) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-green-500/20 border-green-500 text-green-100";
                    } else if (isSelected && !isCorrectAnswer) {
                      btnStyle = "bg-red-500/20 border-red-500 text-red-100";
                    } else {
                      btnStyle = "bg-white/5 border-white/5 opacity-50";
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      onClick={() => handleOptionClick(option)}
                      disabled={answered}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left text-lg font-medium transition-all duration-300 flex items-center justify-between group",
                        btnStyle
                      )}
                    >
                      <span>{option}</span>
                      {answered && isCorrectAnswer && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                      {answered && isSelected && !isCorrectAnswer && <XCircle className="w-6 h-6 text-red-400" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer / Next Button */}
              <div className="h-16 mt-6 flex items-center justify-end">
                {answered && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full shadow-lg shadow-purple-900/40 transition-all"
                  >
                    Next Question <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            // Results Card
            <motion.div
              key="result-card"
              initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 text-center shadow-2xl max-w-lg mx-auto"
            >
              <div className="mb-6 flex justify-center">
                <div className={cn("p-6 rounded-full border-4 shadow-xl", 
                  score >= averageScore ? "bg-green-500/20 border-green-500 shadow-green-900/50" : "bg-orange-500/20 border-orange-500 shadow-orange-900/50"
                )}>
                  {score >= averageScore ? (
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  ) : (
                    <RefreshCw className="w-16 h-16 text-orange-400" />
                  )}
                </div>
              </div>

              <h2 className="text-4xl font-extrabold mb-2 text-white">
                {score >= averageScore ? "Mission Accomplished!" : "Mission Incomplete"}
              </h2>
              
              <p className="text-xl text-gray-300 mb-8">
                You scored <span className="text-white font-bold text-2xl">{score}</span> out of {quizData.length}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all"
                >
                  <RefreshCw className="w-5 h-5" /> Retake
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full shadow-lg shadow-purple-900/30 transition-all"
                >
                  <Home className="w-5 h-5" /> Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}