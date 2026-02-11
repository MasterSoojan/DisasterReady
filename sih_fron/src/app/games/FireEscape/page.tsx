"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Sparkles, CameraShake, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TYPE DEFINITIONS ---
type Choice = {
  text: string;
  next: string;
  consequences?: { health?: number; visibility?: number };
  correct?: string;
  wrong?: string;
};

type Scenario = {
  text: string;
  choices: Choice[];
  outcome?: 'win' | 'loss';
};

// --- GAME DATA (Identical to your original logic) ---
const scenarios: Record<string, Scenario> = {
  'start': { text: "The fire alarm blares. A faint smell of smoke hangs in the air. You're in your bedroom. The door is slightly ajar.", choices: [ { text: "Check door for heat", next: 'check_door_heat', correct: "Crucial first step." }, { text: "Open door and peek", next: 'hallway_check', wrong: "Too risky!" }, { text: "Stay and call help", next: 'stay_in_room' } ] },
  'check_door_heat': { text: "The door and knob are alarmingly hot! The fire is right outside.", choices: [ { text: "Open it anyway!", next: 'open_hot_door_loss', wrong: "Instant backdraft." }, { text: "Keep closed & seal", next: 'seal_door', correct: "Barriers save lives." } ] },
  'open_hot_door_loss': { text: "A blast of superheated air erupts into the room. You had no chance.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
  'hallway_check': { text: "You crack the door. The hallway is a wall of black smoke. You hear crackling.", choices: [ { text: "Crawl low", next: 'stairs_crawl', consequences: { health: -10, visibility: -40 }, correct: "Cleanest air is low." }, { text: "Run for stairs", next: 'stairs_run', consequences: { health: -40, visibility: -80 }, wrong: "Smoke kills faster than fire." }, { text: "Retreat & seal", next: 'seal_door', correct: "Smart retreat." } ] },
  'stay_in_room': { text: "Smoke seeps under the door. Time is running out.", choices: [ { text: "Seal door crack", next: 'seal_door', correct: "Slows the smoke." }, { text: "Find dog", next: 'find_pet_loss', wrong: "Get out first, then tell firemen." }, { text: "Grab valuables", next: 'delay', consequences: { health: -30, visibility: -20 }, wrong: "Possessions are replaceable." } ] },
  'find_pet_loss': { text: "You waste seconds calling your panicked dog. The smoke overpowers you.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
  'seal_door': { text: "Door sealed. Heat is building. You are trapped on the 3rd floor.", choices: [ { text: "Signal from window", next: 'signal_help', correct: "Best option when trapped." }, { text: "Make rope", next: 'bedsheet_rope' }, { text: "Smash window", next: 'break_window_trapped', consequences: { health: -10 }, wrong: "Feeds the fire oxygen." } ] },
  'signal_help': { text: "Firefighters see you! They raise a ladder. You survived!", choices: [ { text: "Play Again", next: 'reset' } ], outcome: 'win' },
  'stairs_crawl': { text: "Crawling low, heat is intense. You see the EXIT sign but hear a neighbor coughing.", choices: [ { text: "Head for Exit", next: 'exit_door', correct: "Save yourself to save others." }, { text: "Take Elevator", next: 'elevator_trap_loss', wrong: "Elevators are coffins in fires." }, { text: "Help Neighbor", next: 'help_neighbor', correct: "Heroic, but risky." } ] },
  'help_neighbor': { text: "You grab your disorientation neighbor and guide them.", choices: [ { text: "Escape together", next: 'exit_door_with_neighbor' } ] },
  'exit_door_with_neighbor': { text: "You both burst into the fresh night air. Hero!", choices: [ { text: "Play Again", next: 'reset' } ], outcome: 'win' },
  'elevator_trap_loss': { text: "The elevator stops between floors. Smoke fills the cabin.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
  'bedsheet_rope': { text: "You tie sheets to the bedframe. It looks sketchy.", choices: [ { text: "Climb down", next: 'climb_rope', consequences: { health: -15 }, correct: "Desperate times." }, { text: "Wait for help", next: 'signal_help', correct: "Wise choice." } ] },
  'climb_rope': { text: "You slide down, burning your hands, but land safely on the grass.", choices: [ { text: "Play Again", next: 'reset' } ], outcome: 'win' },
  'exit_door': { text: "You push the heavy door and breathe fresh night air. Safe!", choices: [ { text: "Play Again", next: 'reset' } ], outcome: 'win' },
  'stairs_run': { text: "You stand up to run. One breath of superheated smoke knocks you out.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
  'delay': { text: "By the time you grab your laptop, the exit is blocked.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
  'break_window_trapped': { text: "The broken window pulls fire into the room like a vacuum.", choices: [ { text: "Restart", next: 'reset' } ], outcome: 'loss' },
};

// --- 3D COMPONENTS ---

const FireEnvironment = ({ health, visibility }: { health: number, visibility: number }) => {
  // Convert stats to visual parameters
  const dangerLevel = (100 - health) / 100; // 0 (safe) to 1 (dead)
  const smokeDensity = (100 - visibility) / 100; // 0 (clear) to 1 (blind)

  // Refs for animation
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Flicker effect for fire
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 1 + (dangerLevel * 2);
    }
  });

  // Calculate colors based on health
  const bgColors = {
    safe: new THREE.Color('#1a0505'),
    danger: new THREE.Color('#450a0a'),
  };
  const currentColor = bgColors.safe.lerp(bgColors.danger, dangerLevel);

  return (
    <>
      <color attach="background" args={[currentColor]} />
      
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight 
        ref={lightRef}
        position={[0, -2, 5]} 
        color="#ff4500" 
        distance={20} 
        decay={2}
      />

      {/* Embers (Always present, increasing with danger) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles 
          count={50 + (dangerLevel * 200)} 
          scale={10} 
          size={4 + (dangerLevel * 4)} 
          speed={0.4} 
          opacity={0.8} 
          color={dangerLevel > 0.5 ? "#ffaa00" : "#ff4500"}
          position={[0, 0, -5]}
        />
      </Float>

      {/* Smoke Clouds - Reacts to Visibility */}
      <group position={[0, -2, -5]}>
        {/* Base smoke */}
        <Cloud 
          opacity={0.3 + (smokeDensity * 0.5)} 
          speed={0.4} 
          width={10} 
          depth={1.5} 
          segments={20} 
          color={smokeDensity > 0.6 ? "#111111" : "#2a2a2a"}
        />
        
        {/* Intrusive smoke (appears when visibility drops) */}
        {smokeDensity > 0.3 && (
           <Cloud 
           opacity={smokeDensity} 
           speed={0.8} 
           width={5} 
           depth={2} 
           segments={10} 
           position={[0, 1, 3]} // Closer to camera
           color="#000000"
         />
        )}
      </group>

      {/* Camera Shake - Reacts to Health */}
      <CameraShake 
        maxYaw={0.02 + (dangerLevel * 0.05)} 
        maxPitch={0.02 + (dangerLevel * 0.05)} 
        maxRoll={0.02 + (dangerLevel * 0.05)} 
        yawFrequency={0.2 + (dangerLevel)} 
        pitchFrequency={0.2 + (dangerLevel)} 
        rollFrequency={0.2 + (dangerLevel)} 
        intensity={1} 
      />
    </>
  );
};

// --- UI COMPONENTS ---

const StatBadge = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 w-full sm:w-32 transition-all duration-300">
    <div className={`p-2 rounded-full mb-2 bg-black/30 ${color}`}>
      {icon}
    </div>
    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">{label}</span>
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} 
        style={{ width: `${value}%` }} 
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function FireEscape3D() {
  // Game State
  const [health, setHealth] = useState(100);
  const [visibility, setVisibility] = useState(100);
  const [currentScenarioId, setCurrentScenarioId] = useState('start');
  const [outcome, setOutcome] = useState<'win' | 'loss' | null>(null);
  const [feedback, setFeedback] = useState<{ text: string, type: 'correct' | 'wrong' | null }>({ text: '', type: null });
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>([]);

  const currentScenario = scenarios[currentScenarioId];
  const isGameOver = outcome !== null;

  // Initial Shuffle & Reset
  useEffect(() => {
    resetGame();
  }, []);

  // Shuffle Choices on Scenario Change
  useEffect(() => {
    if (currentScenario?.choices) {
      setShuffledChoices([...currentScenario.choices].sort(() => Math.random() - 0.5));
    }
  }, [currentScenarioId]);

  // Check Game Over Conditions
  useEffect(() => {
    if (!outcome) {
      if (health <= 0) setOutcome('loss');
      if (visibility <= 0) setOutcome('loss');
    }
  }, [health, visibility, outcome]);

  const resetGame = () => {
    setHealth(100);
    setVisibility(100);
    setCurrentScenarioId('start');
    setOutcome(null);
    setFeedback({ text: '', type: null });
  };

  const handleChoice = (choice: Choice) => {
    if (choice.next === 'reset') {
      resetGame();
      return;
    }

    // Apply consequences
    if (choice.consequences) {
      setHealth(h => Math.max(0, h + (choice.consequences?.health || 0)));
      setVisibility(v => Math.max(0, v + (choice.consequences?.visibility || 0)));
    }

    // Set feedback
    if (choice.correct) setFeedback({ text: choice.correct, type: 'correct' });
    else if (choice.wrong) setFeedback({ text: choice.wrong, type: 'wrong' });
    else setFeedback({ text: '', type: null });

    // Transition
    const nextScenario = scenarios[choice.next];
    if (nextScenario.outcome) setOutcome(nextScenario.outcome);
    setCurrentScenarioId(choice.next);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-orange-500/50">
      
      {/* 1. 3D BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <FireEnvironment health={health} visibility={visibility} />
        </Canvas>
      </div>

      {/* 2. VIGNETTE OVERLAY (Pulses when low health) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${0.6 + ((100-visibility)/200)}) 90%)`,
          boxShadow: health < 40 ? `inset 0 0 100px rgba(255,0,0,${(40-health)/50})` : 'none'
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
               icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>} 
             />
             <StatBadge 
               label="Visibility" 
               value={visibility} 
               color="text-blue-400"
               icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>} 
             />
           </div>
        </header>

        {/* MAIN CARD */}
        <AnimatePresence mode='wait'>
          <motion.div 
            key={currentScenarioId + (outcome || '')}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "w-full max-w-2xl backdrop-blur-xl border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center",
              isGameOver 
                ? outcome === 'win' 
                  ? "bg-green-900/30 border-green-500/30" 
                  : "bg-red-900/30 border-red-500/30"
                : "bg-black/60 border-white/10"
            )}
          >
            {/* Scenario Text */}
            <h2 className={cn(
              "text-2xl md:text-3xl font-bold mb-8 leading-snug",
              isGameOver ? (outcome === 'win' ? "text-green-200" : "text-red-200") : "text-gray-100"
            )}>
              {isGameOver 
                ? (outcome === 'win' ? "🎉 YOU SURVIVED!" : "💀 GAME OVER") 
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
                     {choice.next === 'reset' 
                        ? <span className="text-xl">↻</span> 
                        : <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">{i+1}</span>}
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
                  feedback.type === 'correct' 
                    ? "bg-green-500/20 border-green-500/30 text-green-300" 
                    : "bg-red-500/20 border-red-500/30 text-red-300"
                )}
              >
                {feedback.type === 'correct' ? "✓ Good Decision: " : "⚠ Warning: "}
                {feedback.text}
              </motion.div>
            )}

            {isGameOver && (
               <p className="mt-4 text-gray-300 max-w-md">
                 {outcome === 'win' 
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