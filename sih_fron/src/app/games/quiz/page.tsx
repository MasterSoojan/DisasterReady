"use client";

import { useReducer } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Home,
  ArrowRight,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { quizData } from "@/features/games/quiz/questions";
import { QuizScene } from "@/features/games/quiz/Scene";
import { quizSession, initialQuizSession } from "@/features/games/quiz/session";

// --- MAIN COMPONENT ---

export default function QuizPage() {
  const [state, dispatch] = useReducer(quizSession, initialQuizSession);
  const { currentQ, score, submitted, selectedOption } = state;
  const answered = selectedOption !== null;
  const handleOptionClick = (option: string) =>
    dispatch({ type: "answer", option });
  const handleNext = () => dispatch({ type: "next" });
  const handleRetake = () => dispatch({ type: "retake" });

  const averageScore = Math.ceil(quizData.length / 2);
  const progress = ((currentQ + 1) / quizData.length) * 100;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 py-8 text-white font-sans">
      {/* 3D Background */}
      <QuizScene />

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
            Practice the supplied questions. This is not a safety qualification.
          </p>
        </motion.div>

        <p className="mb-4 text-center text-sm text-slate-300">
          Results last for this page visit only; they are not saved to your
          account. Content needs expert review.
        </p>
        <Link
          href="/games"
          className="mb-4 inline-block rounded-full border border-white/30 px-4 py-2"
        >
          Back to games
        </Link>
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
              <div
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="w-full bg-gray-700/50 rounded-full h-2.5 mb-6 overflow-hidden"
              >
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
                  let btnStyle =
                    "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/50";

                  if (answered) {
                    if (isCorrectAnswer) {
                      btnStyle =
                        "bg-green-500/20 border-green-500 text-green-100";
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
                        btnStyle,
                      )}
                    >
                      <span>{option}</span>
                      {answered && isCorrectAnswer && (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      )}
                      {answered && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {answered && (
                <p role="status" className="mt-4">
                  {selectedOption === quizData[currentQ].answer
                    ? "Correct."
                    : `Not quite. The expected answer is: ${quizData[currentQ].answer}.`}
                </p>
              )}
              {/* Footer / Next Button */}
              <div className="h-16 mt-6 flex items-center justify-end">
                {answered && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full shadow-lg shadow-purple-900/40 transition-all"
                  >
                    {currentQ === quizData.length - 1
                      ? "View results"
                      : "Next Question"}{" "}
                    <ArrowRight className="w-5 h-5" />
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
                <div
                  className={cn(
                    "p-6 rounded-full border-4 shadow-xl",
                    score >= averageScore
                      ? "bg-green-500/20 border-green-500 shadow-green-900/50"
                      : "bg-orange-500/20 border-orange-500 shadow-orange-900/50",
                  )}
                >
                  {score >= averageScore ? (
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  ) : (
                    <RefreshCw className="w-16 h-16 text-orange-400" />
                  )}
                </div>
              </div>

              <h2 className="text-4xl font-extrabold mb-2 text-white">
                {score >= averageScore
                  ? "Mission Accomplished!"
                  : "Mission Incomplete"}
              </h2>

              <p className="text-xl text-gray-300 mb-8">
                You scored{" "}
                <span className="text-white font-bold text-2xl">{score}</span>{" "}
                out of {quizData.length}
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
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
