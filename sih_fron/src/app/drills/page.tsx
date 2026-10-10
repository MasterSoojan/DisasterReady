"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Flame,
  Waves,
  Activity,
  Timer,
  Volume2,
  VolumeX,
  Star,
} from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { Stars, Float } from "@react-three/drei";
import { OptionalCloud as Cloud } from "@/features/learning/OptionalCloud";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { drills, type Drill } from "@/features/drills/data";
import {
  EarthquakeScene,
  FireScene,
  FloodScene,
  VictoryScene,
} from "@/features/drills/Scene";
import { useDrill } from "@/features/drills/useDrill";

function DrillIcon({ id }: { id: Drill["icon"] }) {
  const Icon = { fire: Flame, earthquake: Activity, flood: Waves }[id];
  return <Icon className="h-8 w-8 shrink-0" aria-hidden="true" />;
}

/* ---------- MAIN COMPONENT ---------- */
export default function DrillSimulator() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useDarkMode();
  const drill = useDrill();
  const {
    selectedDrill,
    selectedSteps,
    score,
    timeLeft,
    audioEnabled,
    canFinish,
  } = drill;
  const completed = drill.status === "completed";
  const mascotMessage = drill.message;
  const shakeIndex =
    drill.feedback?.kind === "wrong" ? drill.feedback.index : null;
  const startDrill = drill.start;
  const stopDrill = drill.stop;
  const handleBack = () => (selectedDrill ? stopDrill() : router.push("/"));
  const handleFinish = drill.finish;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
      }`}
    >
      {/* ================= 3D BACKGROUND LAYER ================= */}
      <div className="fixed inset-0 z-0">
        <DecorativeCanvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <>
            {!selectedDrill && !completed && (
              <>
                <ambientLight intensity={0.5} />
                <Stars />
                <Float speed={1}>
                  <Cloud opacity={0.5} color={darkMode ? "gray" : "white"} />
                </Float>
              </>
            )}
            {selectedDrill?.id === "earthquake" && !completed && (
              <EarthquakeScene />
            )}
            {selectedDrill?.id === "fire" && !completed && <FireScene />}
            {selectedDrill?.id === "flood" && !completed && <FloodScene />}
            {completed && <VictoryScene />}
          </>
        </DecorativeCanvas>
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        <SiteHeader
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
          current="drills"
        >
          <button
            type="button"
            aria-label="Drill sound"
            aria-pressed={audioEnabled}
            onClick={drill.toggleAudio}
            className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </SiteHeader>
        {/* --- BACK BUTTON --- */}
        <div className="px-6 pt-6 w-full max-w-7xl mx-auto pointer-events-auto">
          <button
            onClick={handleBack}
            className={`px-4 py-2 rounded-xl font-bold shadow-md transition-all hover:scale-105 flex items-center gap-2 ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-indigo-600 hover:bg-blue-50"
            }`}
          >
            <FiArrowLeft /> {selectedDrill ? "All drills" : "Back Home"}
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto pointer-events-auto">
          <p className="mb-6 max-w-2xl rounded-xl bg-white/90 p-4 text-sm text-slate-900">
            Practice only. Supplied steps need expert review; game scores do not
            establish real-world safety or emergency readiness. Results are not
            saved to your account.
          </p>
          {drill.audioError && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-950"
            >
              Sound unavailable or blocked. You can continue the practice
              without audio.
            </p>
          )}
          {/* --- SELECTION MENU --- */}
          {!selectedDrill && !completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full"
            >
              <h1 className="text-4xl sm:text-5xl font-black mb-2">
                Select Mission 🚨
              </h1>
              <p className="text-xl mb-10 opacity-80">
                Choose a scenario to simulate.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drills.map((drill) => (
                  <motion.button
                    key={drill.id}
                    onClick={() => startDrill(drill)}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-6 rounded-2xl shadow-xl flex flex-col items-start gap-3 border-l-8 transition-all overflow-hidden group ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between w-full">
                      <div
                        className={`p-3 rounded-xl ${drill.color} shadow-lg`}
                      >
                        <DrillIcon id={drill.icon} />
                      </div>
                      <div className="flex gap-1">
                        {[...Array(drill.difficulty)].map((_, i) => (
                          <Star key={i} size={12} fill="orange" stroke="none" />
                        ))}
                      </div>
                    </div>
                    <div className="text-left z-10">
                      <h2 className="text-xl font-black uppercase tracking-wider">
                        {drill.name}
                      </h2>
                      <p className="text-sm opacity-70 leading-tight mt-1">
                        {drill.description}
                      </p>
                    </div>
                    <div className="mt-2 text-xs font-mono bg-black/10 px-2 py-1 rounded">
                      PRIORITY: HIGH
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- ACTIVE DRILL INTERFACE --- */}
          {selectedDrill && !completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl relative"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap gap-3 justify-between items-center mb-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white shadow-lg">
                <div className="text-xs opacity-70 font-mono">
                  MISSION IN PROGRESS
                </div>
                <div className="flex-grow mx-6 flex flex-col justify-center">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>
                      <Timer size={12} className="inline mr-1" />
                      TIME
                    </span>
                    <span
                      role="timer"
                      aria-label="Time remaining"
                      className={
                        timeLeft < 10
                          ? "text-red-400 animate-pulse"
                          : "text-green-400"
                      }
                    >
                      {timeLeft}s
                    </span>
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
                  <output
                    aria-label="Drill score"
                    className="text-xl font-black text-yellow-400"
                  >
                    {score}
                  </output>
                </div>
              </div>

              {/* Drill Card */}
              <div
                className={`p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-white/20 relative overflow-hidden ${darkMode ? "bg-gray-900/80" : "bg-white/90"}`}
              >
                {/* 🐶 Mascot */}
                <div className="mb-4 flex items-center justify-center gap-3 pointer-events-none">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={mascotMessage}
                    role="status"
                    className="rounded-xl bg-white p-3 text-center text-sm font-semibold text-black"
                  >
                    {mascotMessage}
                  </motion.div>
                  <div className="text-5xl md:text-7xl drop-shadow-xl">🐶</div>
                </div>

                <h3 className="text-2xl font-bold mb-6 text-center flex justify-center items-center gap-2">
                  <DrillIcon id={selectedDrill.icon} />{" "}
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    Execute Safety Steps
                  </span>
                </h3>

                <div className="grid gap-3 relative z-10">
                  {selectedDrill.steps.map((step, i) => {
                    const isSelected = selectedSteps.includes(i);
                    const isShaking = shakeIndex === i;

                    return (
                      <motion.button
                        key={i}
                        onClick={() => drill.choose(i)}
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
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${isSelected ? "border-white bg-white text-green-600" : "border-gray-400 text-gray-400"}`}
                          >
                            {i + 1}
                          </span>
                          {step.text}
                        </span>
                        {isSelected && (
                          <ShieldCheck size={24} className="animate-bounce" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  {drill.status === "expired" && (
                    <div className="mb-4">
                      <p role="alert" className="mb-3 font-semibold">
                        Time is up. This attempt cannot be completed.
                      </p>
                      <button
                        type="button"
                        onClick={() => startDrill(selectedDrill)}
                        className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleFinish}
                    disabled={!canFinish}
                    className={`w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 ${
                      canFinish
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <ShieldCheck /> Finish practice
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- VICTORY SCREEN --- */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center relative z-20 max-w-lg w-full"
            >
              <div className="bg-black/60 backdrop-blur-xl p-10 rounded-3xl border-2 border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.4)]">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-7xl drop-shadow-2xl">
                  🏆
                </div>

                <h1 className="text-5xl font-black text-yellow-400 mb-2 mt-4 drop-shadow-md">
                  Practice complete!
                </h1>
                <p className="text-xl text-white font-bold mb-6">
                  You selected the expected steps for this scenario.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-white/10 p-4 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-300">FINAL SCORE</div>
                    <div className="text-2xl font-bold text-yellow-300">
                      {score}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-300">TIME LEFT</div>
                    <div className="text-2xl font-bold text-green-300">
                      {timeLeft}s
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={stopDrill}
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
