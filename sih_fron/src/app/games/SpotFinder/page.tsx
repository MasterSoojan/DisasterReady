'use client';

import React, { useState, FC, useEffect, useRef } from 'react';

// --- TYPE DEFINITIONS ---
interface SpotData {
  x: number; y: number; w: number; h: number;
  color: string; label: string; feedback: string;
}

interface RoomData {
  name: string;
  themeColor: string; // Used for floor accents
  safeSpots: SpotData[];
  unsafeSpots: SpotData[];
}

// --- SVG ICONS (Slightly optimized for 3D card look) ---
const objectVisuals: { [key: string]: React.ReactNode } = {
  'Desk': <svg viewBox="0 0 100 70" fill="currentColor"><path opacity="0.7" d="M5 60 V20 H20 V60z M80 60 V20 H95 V60z" /><path d="M0 10 L100 0 V15 L0 25z" /></svg>,
  'Window': <svg viewBox="0 0 100 100" stroke="currentColor" fill="currentColor"><path fill="none" strokeWidth="6" d="M5 5 H95 V95 H5z" /><path opacity="0.3" fill="currentColor" stroke="none" d="M8 8 H92 V92 H8z" /><path strokeWidth="6" d="M5 50 H95 M50 5 V95" /><path strokeWidth="3" stroke="white" opacity="0.7" d="M15 85 L85 15" /></svg>,
  'Table': <svg viewBox="0 0 100 70" fill="currentColor"><path opacity="0.7" d="M5 60 V20 H20 V60z M80 60 V20 H95 V60z" /><path d="M0 10 L100 0 V15 L0 25z" /></svg>,
  'Shelf': <svg viewBox="0 0 100 100" fill="currentColor"><path opacity="0.6" d="M5 0 H95 V100 H5z" /><path d="M0 15 H100 V20 H0z M0 50 H100 V55 H0z M0 85 H100 V90 H0z" /><path opacity="0.8" d="M15 20 V15 h10v5z m20 0 V15 h10v5z M60 55 V50 h15v5z M20 90 V85 h10v5z m30 0 V85 h20v5z" /></svg>,
  'Open Ground': <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6"><path d="M5 95 C 30 70, 70 70, 95 95" strokeLinecap="round"/><path d="M25 80 C 40 60, 60 60, 75 80" strokeLinecap="round"/><path d="M45 65 C 50 55, 50 55, 55 65" strokeLinecap="round"/></svg>,
  'Wall': <svg viewBox="0 0 100 100" fill="currentColor"><path opacity="0.2" d="M0 0 H100 V100 H0z" /><path fill="none" stroke="currentColor" strokeWidth="4" d="M0 25 H100 M0 50 H100 M0 75 H100 M50 0 V25 M25 25 V50 M75 25 V50 M50 50 V75 M25 75 V100 M75 75 V100" /></svg>,
  'Sturdy Desk': <svg viewBox="0 0 100 70" fill="currentColor"><path opacity="0.7" d="M5 60 V20 H20 V60z M80 60 V20 H95 V60z" /><path d="M0 10 L100 0 V15 L0 25z" /></svg>,
  'Elevator': <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6"><path d="M20 5 H80 V95 H20z" /><path strokeWidth="4" d="M40 95 V5 M60 95 V5" /><path fill="currentColor" d="M50 20 L40 30 H60z M50 80 L40 70 H60z" /></svg>,
  'Tall Bookshelf': <svg viewBox="0 0 100 100" fill="currentColor"><path opacity="0.6" d="M5 0 H95 V100 H5z" /><path d="M0 15 H100 V20 H0z M0 50 H100 V55 H0z M0 85 H100 V90 H0z" /><path opacity="0.8" d="M15 20 V15 h10v5z m20 0 V15 h10v5z M60 55 V50 h15v5z M20 90 V85 h10v5z m30 0 V85 h20v5z" /></svg>,
  'Against Interior Wall': <svg viewBox="0 0 100 100" fill="currentColor"><path opacity="0.2" d="M0 0 H100 V100 H0z" /><path fill="none" stroke="currentColor" strokeWidth="4" d="M0 25 H100 M0 50 H100 M0 75 H100 M50 0 V25 M25 25 V50 M75 25 V50 M50 50 V75 M25 75 V100 M75 75 V100" /></svg>,
  'Store Entrance': <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6"><path d="M5 5 H95 V95 H5z"/><path d="M50 5 V95"/><path fill="currentColor" opacity="0.5" d="M40 45 h-5 v10 h5z M65 45 h-5 v10 h5z"/></svg>,
  'Pulled Over, Inside Car': <svg viewBox="0 0 100 60" fill="currentColor"><path d="M95,35 H85 L75,20 H25 L15,35 H5 C2,35 0,37 0,40 V48 C0,50 2,52 5,52 H15 V58 H25 V52 H75 V58 H85 V52 H95 C98,52 100,50 100,48 V40 C100,37 98,35 95,35 z M28,35 H72 V45 H28 V35 z"/></svg>,
  'Under an Overpass': <svg viewBox="0 0 100 100" fill="currentColor"><path opacity="0.7" d="M10 50 v40 h15 V50z M75 50 v40 h15 V50z"/><path d="M0 10 C 20 20, 80 20, 100 10 V40 H0z"/><path fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 8" d="M0 25 H100"/></svg>,
  'Between Seats': <svg viewBox="0 0 100 100" fill="currentColor"><path d="M5 80 L20 10 H40 L55 80 H5z M95 80 L80 10 H60 L45 80 H95z"/><path opacity="0.5" d="M20 10 H40 V20 H20z M80 10 H60 V20 H80z"/></svg>,
};


// --- GAME DATA ---
const rooms: RoomData[] = [
    { name: "Classroom", themeColor: "#4f46e5", safeSpots: [{x: 100, y: 300, w: 180, h: 120, color: "var(--safe-color)", label: "Desk", feedback: "✅ Correct! Drop, Cover, and Hold On under the desk."}], unsafeSpots: [{x: 550, y: 50, w: 150, h: 250, color: "var(--unsafe-color)", label: "Window", feedback: "❌ Unsafe! Glass can shatter inward explosively."}] },
    { name: "Kitchen", themeColor: "#8b5cf6", safeSpots: [{x: 150, y: 280, w: 220, h: 120, color: "var(--safe-color)", label: "Table", feedback: "✅ Correct! This strong table protects from falling debris."}], unsafeSpots: [{x: 500, y: 50, w: 180, h: 280, color: "var(--unsafe-color)", label: "Shelf", feedback: "❌ Unsafe! Heavy appliances and dishes will fall."}] },
    { name: "Playground", themeColor: "#10b981", safeSpots: [{x: 250, y: 200, w: 200, h: 150, color: "var(--safe-color)", label: "Open Ground", feedback: "✅ Correct! Stay away from buildings and power lines."}], unsafeSpots: [{x: 600, y: 80, w: 150, h: 250, color: "var(--unsafe-color)", label: "Wall", feedback: "❌ Unsafe! Exterior walls are the first to collapse."}] },
    { name: "Office", themeColor: "#64748b", safeSpots: [{x: 80, y: 300, w: 200, h: 100, color: "var(--safe-color)", label: "Sturdy Desk", feedback: "✅ Correct! Ideal protection against ceiling tiles."}], unsafeSpots: [{x: 650, y: 100, w: 120, h: 300, color: "var(--unsafe-color)", label: "Elevator", feedback: "❌ Unsafe! Power may fail, trapping you inside."}] },
    { name: "Library", themeColor: "#a16207", safeSpots: [{x: 300, y: 280, w: 200, h: 120, color: "var(--safe-color)", label: "Table", feedback: "✅ Correct! A wooden table is safer than the aisles."}], unsafeSpots: [{x: 600, y: 20, w: 140, h: 350, color: "var(--unsafe-color)", label: "Tall Bookshelf", feedback: "❌ Unsafe! Heavy books and the shelf itself will tip over."}] },
    { name: "Mall", themeColor: "#0891b2", safeSpots: [{x: 100, y: 200, w: 200, h: 200, color: "var(--safe-color)", label: "Against Interior Wall", feedback: "✅ Correct! Structural interior walls are safer than glass fronts."}], unsafeSpots: [{x: 550, y: 80, w: 200, h: 280, color: "var(--unsafe-color)", label: "Store Entrance", feedback: "❌ Unsafe! Falling signage and shattering glass are deadly."}] },
    { name: "Car", themeColor: "#be185d", safeSpots: [{x: 150, y: 250, w: 450, h: 140, color: "var(--safe-color)", label: "Pulled Over, Inside Car", feedback: "✅ Correct! The metal frame offers protection. Use parking brake."}], unsafeSpots: [{x: 680, y: 50, w: 100, h: 350, color: "var(--unsafe-color)", label: "Under an Overpass", feedback: "❌ Unsafe! Bridges and overpasses are high collapse risks."}] },
    { name: "Bus", themeColor: "#f97316", safeSpots: [{x: 250, y: 250, w: 250, h: 150, color: "var(--safe-color)", label: "Between Seats", feedback: "✅ Correct! Crouch below window level to avoid glass."}], unsafeSpots: [{x: 600, y: 80, w: 120, h: 320, color: "var(--unsafe-color)", label: "Window", feedback: "❌ Unsafe! Large windows are the main hazard here."}] }
];


// --- CHILD COMPONENTS ---

const Spot: FC<{ spot: SpotData & {isSafe: boolean}; isAnswered: boolean; onSelect: () => void }> = ({ spot, isAnswered, onSelect }) => {
  const [clicked, setClicked] = useState(false);

  // If this specific spot was clicked/answered
  const stateClass = isAnswered 
    ? (spot.isSafe ? 'spot-safe' : 'spot-unsafe') 
    : 'spot-neutral';

  const handleClick = () => {
    if(!isAnswered) {
        setClicked(true);
        onSelect();
    }
  };

  return (
    <div
      className={`spot-3d-container ${isAnswered ? 'disabled' : ''} ${stateClass}`}
      style={{
        left: `${spot.x}px`,
        top: `${spot.y}px`,
        width: `${spot.w}px`,
        height: `${spot.h}px`,
        '--spot-theme': isAnswered 
            ? (spot.isSafe ? 'var(--safe-color)' : 'var(--unsafe-color)') 
            : 'var(--neutral-card)',
      } as React.CSSProperties}
      onClick={handleClick}
      role="button"
      tabIndex={isAnswered ? -1 : 0}
    >
      <div className="spot-3d-face">
        <div className="icon-wrapper">{objectVisuals[spot.label]}</div>
        <div className="label-plate">{spot.label}</div>
      </div>
      <div className="spot-shadow"></div>
    </div>
  );
};

const GameScreen: FC<{ room: RoomData; score: number; answered: boolean; onChoice: (isSafe: boolean) => void; onNext: () => void; isLastRoom: boolean }> = ({ room, score, answered, onChoice, onNext, isLastRoom }) => {
  const [randomizedSpots, setRandomizedSpots] = useState<(SpotData & {isSafe: boolean})[]>([]);

  useEffect(() => {
    // Randomize L/R positions but keep logic
    const safeSpot = { ...room.safeSpots[0], isSafe: true };
    const unsafeSpot = { ...room.unsafeSpots[0], isSafe: false };
    
    // Shuffle which object goes to which coordinate slot (roughly) to prevent muscle memory
    // Note: For this visual design, we are keeping the strict x/y from data to ensure they don't overlap,
    // but we can shuffle the order in the DOM for tab-indexing variety.
    // To truly randomize positions physically, we would need dynamic coordinate generation.
    // For now, we stick to the preset distinct areas but shuffle the array.
    const spots = [safeSpot, unsafeSpot].sort(() => Math.random() - 0.5);
    setRandomizedSpots(spots);
  }, [room]);

  return (
    <>
      <div className="hud-layer">
        <div className="score-board">
            <span className="score-label">SAFETY SCORE</span>
            <span className="score-value">{score}</span>
        </div>
      </div>

      <div className="scene-container">
        <div className="room-floor" style={{ '--floor-accent': room.themeColor } as React.CSSProperties}>
          
          <div className="room-label">
            <h2>{room.name}</h2>
            <p>Where is the safe spot?</p>
          </div>

          {/* Grid lines for 3D effect */}
          <div className="grid-overlay"></div>

          {randomizedSpots.map((spot, i) => (
            <Spot key={`spot-${room.name}-${i}`} spot={spot} isAnswered={answered} onSelect={() => onChoice(spot.isSafe)} />
          ))}

          {answered && (
            <div className="feedback-overlay">
                {randomizedSpots.map((spot, i) => {
                   if (!spot.isSafe && !spot.feedback) return null; // Logic check
                   
                   // Position bubble relative to the spot in 3D space is hard, so we use absolute overlay
                   // We map the bubble to the spot's center
                   const isWinningSpot = spot.isSafe;
                   
                   return (
                       <div 
                        key={`fb-${i}`} 
                        className={`feedback-card ${isWinningSpot ? 'success' : 'danger'}`}
                        style={{
                            left: spot.x + (spot.w/2) - 100, // Centered roughly
                            top: spot.y - 60,
                        }}
                       >
                           {spot.feedback}
                       </div>
                   )
                })}
            </div>
          )}
        </div>
      </div>

      {answered && (
        <div className="controls-layer">
            <button className="next-btn-3d" onClick={onNext}>
                {isLastRoom ? "FINISH MISSION" : "NEXT LEVEL ➔"}
            </button>
        </div>
      )}
    </>
  );
};

const ResultScreen: FC<{ score: number; onRestart: () => void }> = ({ score, onRestart }) => (
  <div className="result-layer">
    <div className="result-card-3d">
        <div className="result-header">MISSION REPORT</div>
        <div className="final-score-container">
            <div className="score-circle">
                {score}
            </div>
        </div>
        <p>{score > 50 ? "Excellent survival skills!" : "You need more training."}</p>
        <button className="restart-btn-3d" onClick={onRestart}>REPLAY SIMULATION</button>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function SpotFinder3D() {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  const handleChoice = (isSafe: boolean) => {
    if (answered) return;
    setAnswered(true);
    setScore(prev => prev + (isSafe ? 100 : -20)); // Adjusted scoring for "arcade" feel
  };

  const handleNextRoom = () => {
    const nextRoomIndex = currentRoomIndex + 1;
    if (nextRoomIndex < rooms.length) {
      setCurrentRoomIndex(nextRoomIndex);
      setAnswered(false);
    } else {
      setGameState('finished');
    }
  };

  const restartGame = () => {
    setScore(0);
    setCurrentRoomIndex(0);
    setAnswered(false);
    setGameState('playing');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600&display=swap');
        
        :root {
          --bg-dark: #0f172a;
          --bg-panel: #1e293b;
          --primary: #3b82f6;
          --safe-color: #10b981;
          --unsafe-color: #ef4444;
          --neutral-card: #cbd5e1;
          --text-main: #f1f5f9;
          
          --card-depth: 12px;
          --floor-perspective: 800px;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-dark);
          color: var(--text-main);
          overflow: hidden; /* Prevent scroll on 3D tilt */
        }

        /* --- 3D SCENE SETUP --- */
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at center, #1e293b 0%, #020617 100%);
          perspective: var(--floor-perspective);
          overflow: hidden;
        }

        .scene-container {
          position: relative;
          width: 800px;
          height: 500px;
          transform-style: preserve-3d;
          animation: floatRoom 6s ease-in-out infinite;
        }

        @keyframes floatRoom {
            0%, 100% { transform: translateY(0) rotateX(20deg); }
            50% { transform: translateY(-10px) rotateX(22deg); }
        }

        /* --- THE FLOOR (ROOM) --- */
        .room-floor {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          transform: rotateX(10deg); /* Initial tilt handled by container, but this fine tunes */
          box-shadow: 
            0 50px 80px rgba(0,0,0,0.6),
            inset 0 0 100px rgba(0,0,0,0.5),
            0 0 0 10px rgba(255,255,255,0.02); /* Fake bevel */
          overflow: visible;
        }
        
        /* Grid pattern on floor */
        .grid-overlay {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 40px 40px;
            border-radius: 20px;
            pointer-events: none;
            mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        .room-label {
            position: absolute;
            top: -60px;
            left: 20px;
            text-align: left;
            transform: translateZ(40px); /* Lift text */
            text-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .room-label h2 {
            margin: 0;
            font-family: 'Rajdhani', sans-serif;
            font-size: 3rem;
            text-transform: uppercase;
            color: var(--floor-accent);
            letter-spacing: 2px;
        }
        .room-label p {
            margin: 0;
            opacity: 0.7;
            font-size: 1rem;
        }

        /* --- 3D INTERACTIVE SPOTS --- */
        .spot-3d-container {
            position: absolute;
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-style: preserve-3d;
            transform: translateZ(20px); /* Base elevation */
        }
        
        .spot-3d-container:hover {
            transform: translateZ(40px) scale(1.02);
        }
        .spot-3d-container:active {
            transform: translateZ(10px);
        }

        /* The visual face of the button */
        .spot-3d-face {
            width: 100%;
            height: 100%;
            background-color: var(--spot-theme);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #1e293b;
            position: relative;
            z-index: 2;
            
            /* The 3D Thickness (sides) created via box-shadow */
            box-shadow: 
                0px var(--card-depth) 0px rgba(0,0,0,0.3), /* Depth */
                0px calc(var(--card-depth) + 10px) 20px rgba(0,0,0,0.4), /* Drop shadow */
                inset 0 0 20px rgba(255,255,255,0.4); /* Inner shine */
            
            border: 2px solid rgba(255,255,255,0.4);
            transition: background-color 0.4s;
        }

        /* Specific coloring for answered state */
        .spot-safe .spot-3d-face {
            background: linear-gradient(135deg, #22c55e, #14532d);
            color: white;
            box-shadow: 0px var(--card-depth) 0px #064e3b, 0 30px 50px rgba(34, 197, 94, 0.3);
            border-color: #86efac;
        }
        .spot-unsafe .spot-3d-face {
            background: linear-gradient(135deg, #ef4444, #7f1d1d);
            color: white;
            box-shadow: 0px var(--card-depth) 0px #450a0a, 0 30px 50px rgba(239, 68, 68, 0.3);
            border-color: #fca5a5;
        }

        .icon-wrapper {
            width: 60%;
            height: 60%;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
            transition: transform 0.3s;
        }
        .spot-3d-container:hover .icon-wrapper {
            transform: scale(1.1) rotate(-5deg);
        }

        .label-plate {
            margin-top: 10px;
            background: rgba(0,0,0,0.1);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        /* --- HUD (Heads Up Display) --- */
        .hud-layer {
            position: fixed;
            top: 20px;
            width: 100%;
            display: flex;
            justify-content: center;
            pointer-events: none; /* Let clicks pass through to room */
            z-index: 100;
        }
        .score-board {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 10px 30px;
            border-radius: 40px;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .score-label {
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
            letter-spacing: 1px;
            font-size: 0.9rem;
            color: #94a3b8;
        }
        .score-value {
            font-family: 'Rajdhani', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        /* --- CONTROLS LAYER --- */
        .controls-layer {
            position: fixed;
            bottom: 40px;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 100;
            animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .next-btn-3d {
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            border: none;
            padding: 15px 40px;
            border-radius: 12px;
            color: white;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 6px 0 #1d4ed8, 0 15px 20px rgba(37, 99, 235, 0.4);
            transition: all 0.1s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .next-btn-3d:active {
            transform: translateY(6px);
            box-shadow: 0 0 0 #1d4ed8, 0 0 0 rgba(0,0,0,0);
        }

        /* --- FEEDBACK --- */
        .feedback-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            transform: translateZ(60px); /* Float above spots */
        }
        .feedback-card {
            position: absolute;
            width: 200px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            border-radius: 8px;
            color: white;
            font-size: 0.9rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .feedback-card.success { border-color: var(--safe-color); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
        .feedback-card.danger { border-color: var(--unsafe-color); box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
        
        .feedback-card::after {
            content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
            border-width: 8px 8px 0; border-style: solid;
            border-color: rgba(0,0,0,0.85) transparent transparent transparent;
        }

        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* --- RESULT SCREEN --- */
        .result-layer {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
            z-index: 200;
        }
        .result-card-3d {
            background: #1e293b;
            padding: 50px;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            animation: floatUp 0.6s ease;
        }
        @keyframes floatUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .result-header { font-family: 'Rajdhani'; font-size: 1.5rem; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; }
        .score-circle {
            width: 150px; height: 150px;
            margin: 20px auto;
            border-radius: 50%;
            border: 8px solid var(--primary);
            display: flex; align-items: center; justify-content: center;
            font-size: 3.5rem; font-weight: 800; font-family: 'Rajdhani';
            color: white;
            background: rgba(59, 130, 246, 0.1);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }
        .restart-btn-3d {
            background: transparent;
            border: 2px solid var(--primary);
            color: var(--primary);
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
            margin-top: 20px;
            transition: all 0.2s;
        }
        .restart-btn-3d:hover {
            background: var(--primary);
            color: white;
            box-shadow: 0 0 20px var(--primary);
        }

      `}</style>
      
      <main className="container">
        <h1 style={{ display: 'none' }}>Safe Spot Finder 3D</h1>
        
        {gameState === 'playing' ? (
          <GameScreen
            room={rooms[currentRoomIndex]}
            score={score}
            answered={answered}
            onChoice={handleChoice}
            onNext={handleNextRoom}
            isLastRoom={currentRoomIndex === rooms.length - 1}
          />
        ) : (
          <ResultScreen score={score} onRestart={restartGame} />
        )}
      </main>
    </>
  );
}