"use client";

import React, { useState } from "react";
import { GameExit } from "@/features/games/GameExit";
import { FireEnvironment } from "@/features/games/fire-escape/Environment";
import { createRun, takeChoice } from "@/features/games/fire-escape/engine";
import { scenarios, type Choice } from "@/features/games/fire-escape/scenarios";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- UI COMPONENTS ---

const StatBadge = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 w-full sm:w-32 transition-all duration-300">
    <div className={`p-2 rounded-full mb-2 bg-black/30 ${color}`}>{icon}</div>
    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
      {label}
    </span>
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${color.replace("text-", "bg-")}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function FireEscape3D() {
  const [run, setRun] = useState(createRun);
  const {
    health,
    visibility,
    currentScenarioId,
    outcome,
    feedback,
    choices: shuffledChoices,
  } = run;
  const currentScenario = scenarios[currentScenarioId];
  const isGameOver = outcome !== null;

  const handleChoice = (choice: Choice) => {
    setRun(takeChoice(run, choice));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-orange-500/50">
      <GameExit />

      {/* 1. 3D BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <DecorativeCanvas>
          <FireEnvironment health={health} visibility={visibility} />
        </DecorativeCanvas>
      </div>

      {/* 2. VIGNETTE OVERLAY (Pulses when low health) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${0.6 + (100 - visibility) / 200}) 90%)`,
          boxShadow:
            health < 40
              ? `inset 0 0 100px rgba(255,0,0,${(40 - health) / 50})`
              : "none",
        }}
      />

      {/* 3. GAME UI LAYER */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 md:p-8">
        {/* HEADER & STATS */}
        <header className="absolute top-0 w-full max-w-4xl flex justify-between items-start p-6">
          <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-sm">
            FIRE ESCAPE
          </h1>
          <div className="flex gap-4">
            <StatBadge
              label="Health"
              value={health}
              color="text-red-500"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
            <StatBadge
              label="Visibility"
              value={visibility}
              color="text-blue-400"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
          </div>
        </header>

        {/* MAIN CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenarioId + (outcome || "")}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "w-full max-w-2xl backdrop-blur-xl border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center",
              isGameOver
                ? outcome === "win"
                  ? "bg-green-900/30 border-green-500/30"
                  : "bg-red-900/30 border-red-500/30"
                : "bg-black/60 border-white/10",
            )}
          >
            {/* Scenario Text */}
            <h2
              className={cn(
                "text-2xl md:text-3xl font-bold mb-8 leading-snug",
                isGameOver
                  ? outcome === "win"
                    ? "text-green-200"
                    : "text-red-200"
                  : "text-gray-100",
              )}
            >
              {isGameOver
                ? outcome === "win"
                  ? "🎉 YOU SURVIVED!"
                  : "💀 GAME OVER"
                : currentScenario?.text}
            </h2>

            {/* Choices Grid */}
            <div className="w-full grid grid-cols-1 gap-4">
              {shuffledChoices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(choice)}
                  className="group relative overflow-hidden w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/0 to-orange-600/0 group-hover:from-orange-600/10 group-hover:via-transparent group-hover:to-transparent transition-all duration-500" />
                  <span className="relative z-10 font-bold text-lg text-gray-200 group-hover:text-white flex items-center gap-3">
                    {choice.next === "reset" ? (
                      <span className="text-xl">↻</span>
                    ) : (
                      <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                    )}
                    {choice.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Feedback Toast */}
            {feedback.text && !isGameOver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-6 px-4 py-2 rounded-lg text-sm font-semibold border",
                  feedback.type === "correct"
                    ? "bg-green-500/20 border-green-500/30 text-green-300"
                    : "bg-red-500/20 border-red-500/30 text-red-300",
                )}
              >
                {feedback.type === "correct"
                  ? "✓ Good Decision: "
                  : "⚠ Warning: "}
                {feedback.text}
              </motion.div>
            )}

            {isGameOver && (
              <p className="mt-4 text-gray-300 max-w-md">
                {outcome === "win"
                  ? "Excellent work. Quick thinking under pressure saved your life."
                  : "In a real fire, hesitation or the wrong choice can be fatal. Try again and learn the safest path."}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
