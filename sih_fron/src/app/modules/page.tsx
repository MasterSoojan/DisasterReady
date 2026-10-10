"use client";
import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import {
  DecorativeCanvas,
  useReducedLearningMotion,
} from "@/features/learning/DecorativeCanvas";
import { modules, type Module } from "@/features/modules/data";
import { ModuleScene, ModuleConfetti } from "@/features/modules/Scene";
import {
  moduleSession,
  initialModuleSession,
} from "@/features/modules/session";

// --- MAIN PAGE COMPONENT ---
export default function ModulesPage() {
  const router = useRouter();
  const [session, dispatch] = useReducer(moduleSession, initialModuleSession);
  const [darkMode, setDarkMode] = useDarkMode();
  const reducedMotion = useReducedLearningMotion();
  const selectedModule =
    modules.find((item) => item.id === session.moduleId) ?? null;
  const { stepIndex } = session;
  const showQuiz = session.phase !== "learning";
  const quizComplete = session.phase === "complete";
  const handleBack = () =>
    selectedModule ? dispatch({ type: "exit" }) : router.push("/");
  const startModule = (module: Module) =>
    dispatch({ type: "start", id: module.id });
  const handleNext = () => dispatch({ type: showQuiz ? "exit" : "next" });
  const handleQuizAnswer = (index: number) =>
    dispatch({ type: "answer", index });

  const steps = selectedModule?.steps ?? [];
  const currentStep = steps[stepIndex];
  // Calculate progress: Steps + Quiz
  const totalSteps = steps.length + 1;
  const currentProgress = showQuiz
    ? quizComplete
      ? totalSteps
      : steps.length
    : stepIndex + 1;
  const progressPercent = (currentProgress / totalSteps) * 100;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900"
      }`}
    >
      {/* Show Confetti on Success */}
      {quizComplete && !reducedMotion && <ModuleConfetti />}

      {/* --- 3D CANVAS BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <DecorativeCanvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ModuleScene
            activeModule={selectedModule?.id || null}
            darkMode={darkMode}
          />
        </DecorativeCanvas>
      </div>

      {/* --- UI CONTENT --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
          current="modules"
        />
        {/* Back Button */}
        <div className="px-6 pt-6 max-w-7xl mx-auto w-full">
          <button
            onClick={handleBack}
            className={`px-4 py-2 rounded-xl font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-2 ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-white hover:bg-blue-50 text-indigo-600"
            }`}
          >
            <FiArrowLeft /> {selectedModule ? "All Modules" : "Back Home"}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
          {!selectedModule ? (
            // --- GRID VIEW ---
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <h1
                className={`text-4xl font-black text-center mb-4 ${darkMode ? "text-white" : "text-indigo-900"}`}
              >
                Choose Your Mission! 🚀
              </h1>
              <p className="text-center mb-10 text-lg opacity-80">
                Practice the supplied lesson content. It needs expert review and
                is not emergency guidance.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {modules.map((mod) => (
                  <motion.button
                    type="button"
                    key={mod.id}
                    onClick={() => startModule(mod)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 text-left rounded-3xl cursor-pointer shadow-xl border-l-8 transition-all relative overflow-hidden group ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-blue-400"
                    }`}
                  >
                    <div
                      className={`absolute right-0 top-0 w-24 h-24 opacity-10 rounded-bl-full transition-transform group-hover:scale-150 ${mod.color}`}
                    ></div>
                    <h2
                      className={`text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                    >
                      {mod.name}
                    </h2>
                    <p className="opacity-70">Start this lesson</p>
                  </motion.button>
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
              <div
                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full ${selectedModule.color} text-white shadow-lg z-20`}
              >
                <h1 className="text-lg font-bold uppercase tracking-wider">
                  {selectedModule.name}
                </h1>
              </div>

              {/* Card */}
              <div
                className={`relative overflow-hidden rounded-3xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}
              >
                {/* Progress Bar */}
                <div
                  role="progressbar"
                  aria-label="Lesson progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progressPercent)}
                  className="w-full bg-gray-200 dark:bg-gray-700 h-2"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${selectedModule.color}`}
                  />
                </div>

                <div
                  aria-live="polite"
                  className="p-6 sm:p-10 text-center min-h-[350px] flex flex-col justify-center items-center"
                >
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
                          {stepIndex === 0
                            ? "1️⃣"
                            : stepIndex === 1
                              ? "2️⃣"
                              : "3️⃣"}
                        </span>
                        <h2
                          className={`text-3xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
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
                        <h2
                          className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {selectedModule.quiz.question}
                        </h2>
                        {session.feedback && (
                          <p role="status" className="mb-4 font-semibold">
                            {session.feedback}
                          </p>
                        )}
                        <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                          {selectedModule.quiz.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuizAnswer(idx)}
                              className={`p-4 rounded-xl font-semibold border-2 transition-all hover:scale-105 ${
                                darkMode
                                  ? "border-gray-600 hover:bg-gray-700"
                                  : "border-gray-200 hover:bg-blue-50"
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
                        <h2
                          className={`text-4xl font-black mb-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                        >
                          Awesome Job!
                        </h2>
                        <p className="text-lg opacity-80">
                          You completed this practice lesson—not a safety
                          qualification.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Buttons */}
                <div
                  className={`p-4 sm:p-6 bg-opacity-50 flex flex-wrap gap-3 justify-between items-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
                >
                  <button
                    disabled={stepIndex === 0 && !showQuiz}
                    onClick={() => dispatch({ type: "back" })}
                    className={`px-6 py-2 rounded-xl font-bold transition ${
                      stepIndex === 0 && !showQuiz
                        ? "opacity-0 cursor-default"
                        : darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-200 shadow-sm text-gray-600"
                    }`}
                  >
                    Back
                  </button>

                  {!quizComplete ? (
                    <button
                      onClick={handleNext}
                      className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition ${selectedModule.color}`}
                    >
                      {showQuiz
                        ? "Skip Quiz"
                        : stepIndex < steps.length - 1
                          ? "Next Step"
                          : "Take Quiz"}
                    </button>
                  ) : (
                    <button
                      onClick={() => dispatch({ type: "exit" })}
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
