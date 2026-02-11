"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ---------- ICONS ----------
const HeartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const ZapIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ---------- CSS STYLES ----------
const modernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600&display=swap');

  :root {
    --bg-dark: #0f172a;
    --bg-panel: rgba(30, 41, 59, 0.7);
    --primary: #3b82f6;
    --accent: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    --border: rgba(255,255,255,0.1);
  }

  html, body {
    height: 100%; margin: 0;
    background-color: var(--bg-dark);
    background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  /* --- LAYOUT --- */
  .game-wrapper {
    display: grid;
    grid-template-columns: 1fr 320px;
    height: 100vh;
    padding: 20px;
    gap: 20px;
    box-sizing: border-box;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* --- MAIN GAME AREA --- */
  .viewport-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    border-radius: 16px;
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  }

  /* --- SIDEBAR --- */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .panel {
    background: var(--bg-panel);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .panel-header {
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-muted);
    letter-spacing: 1px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* --- METERS --- */
  .meter-group { margin-bottom: 12px; }
  .meter-label { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; color: var(--text-muted); font-weight: 600; }
  .meter-track {
    height: 12px;
    background: rgba(0,0,0,0.3);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
  }
  .meter-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .meter-fill::after {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
    background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
    background-size: 1rem 1rem;
    animation: move-stripes 1s linear infinite;
  }
  @keyframes move-stripes { from { background-position: 0 0; } to { background-position: 1rem 0; } }

  .bg-health { background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981); }
  .bg-panic { background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
  .bg-hold { background: linear-gradient(90deg, #10b981, #34d399); }

  /* --- STATS GRID --- */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-box { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; text-align: center; }
  .stat-val { font-family: 'Rajdhani', sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 1; }
  .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }

  /* --- CONTROLS --- */
  .btn-primary {
    width: 100%;
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    font-family: 'Rajdhani', sans-serif;
    letter-spacing: 1px;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  }
  .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.4); }
  .btn-primary:active { transform: translateY(1px); }
  
  .btn-secondary {
    background: transparent; border: 1px solid var(--border); color: var(--text-main);
    padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted); }

  select, input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--border);
    color: white;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-family: inherit;
  }

  /* --- LEADERBOARD --- */
  .leaderboard-list {
    list-style: none; padding: 0; margin: 0;
    max-height: 200px; overflow-y: auto;
  }
  .leaderboard-item {
    display: flex; justify-content: space-between;
    padding: 8px; border-bottom: 1px dashed var(--border);
    font-size: 0.9rem;
  }
  .leaderboard-item:last-child { border-bottom: none; }
  .rank-badge { color: var(--accent); font-weight: bold; margin-right: 8px; font-family: 'Rajdhani'; }

  /* --- OVERLAYS --- */
  .game-overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 10;
    animation: fadeIn 0.3s ease;
  }
  
  .overlay-content {
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid var(--border);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
    max-width: 400px;
    width: 90%;
  }

  .big-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .countdown {
    font-size: 8rem; font-weight: 800; font-family: 'Rajdhani';
    color: var(--danger);
    text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
    animation: pulse 1s infinite;
  }

  .shake-warning {
    position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(239, 68, 68, 0.9); color: white;
    padding: 10px 30px; border-radius: 50px;
    font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    animation: shake 0.5s infinite;
    pointer-events: none;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
  @keyframes shake { 0%, 100% { transform: translateX(-50%); } 25% { transform: translateX(calc(-50% - 5px)); } 75% { transform: translateX(calc(-50% + 5px)); } }

  @media(max-width: 900px){
    .game-wrapper { grid-template-columns: 1fr; grid-template-rows: 1fr auto; height: auto; min-height: 100vh; }
    .viewport-container { aspect-ratio: 16/9; }
    .sidebar { display: grid; grid-template-columns: 1fr 1fr; }
  }
  @media(max-width: 600px){
    .sidebar { display: flex; }
    .viewport-container { aspect-ratio: 4/3; }
  }
`;

// ---------- TYPES AND CONFIG ----------
type GameStatus = 'ready' | 'choosing' | 'shaking' | 'score';

interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  ts: number;
}

const CONFIG = {
  canvasWidth: 1200,
  canvasHeight: 720,
  playAreaMargin: 250,
  debrisPerSecond: 4.5,
  shakeDurationBase: 5000,
  choiceDuration: 8.0, // UPDATED: 8 seconds to find cover
  playerSpeed: 220,
  gravity: 800,
  maxHealth: 65,
  holdOnDuration: 2000,
};

// ---------- HELPERS ----------
function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }
function clamp(v: number, a: number, b: number): number { return Math.max(a, Math.min(b, v)); }
function now(): number { return performance.now(); }

// ---------- GAME CLASSES ----------
class Player {
  x: number; y: number; w: number; h: number; health: number; isUnder: CoverObject | null; holdProgress: number;
  constructor(x: number, y: number) {
    this.x = x; this.y = y; this.w = 28; this.h = 48; this.health = CONFIG.maxHealth;
    this.isUnder = null; this.holdProgress = 0;
  }
  rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
}

class CoverObject {
    x: number; y: number; w: number; h: number; type: string; isSafe: boolean; safeRadius: number;
    isToppling: boolean; hasToppled: boolean; toppleAngle: number; toppleDirection: number;
  constructor(x: number, y: number, w: number, h: number, type: string) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.type = type;
    this.isSafe = type === 'desk'; this.safeRadius = Math.max(w, h) * 0.7;
    this.isToppling = false; this.hasToppled = false; this.toppleAngle = 0;
    this.toppleDirection = Math.random() > 0.5 ? 1 : -1;
  }
}

class Debris {
    x: number; y: number; vx: number; vy: number; size: number; alive: boolean;
  constructor(x: number, y: number, vx: number, vy: number, size: number) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.size = size; this.alive = true;
  }
  update(dt: number) {
    this.vy += CONFIG.gravity * dt; this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.y > CONFIG.canvasHeight + 200) this.alive = false;
  }
  rect() { return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size }; }
}

class Particle {
    x: number; y: number; vx: number; vy: number; size: number; lifespan: number; color: string; gravity: number;
    constructor(x: number, y: number, color: string) {
        this.x = x; this.y = y; this.vx = rand(-150, 150); this.vy = rand(-200, 50);
        this.size = rand(2, 5); this.lifespan = rand(0.3, 0.8); this.color = color;
        this.gravity = CONFIG.gravity * 0.8;
    }
    update(dt: number) {
        this.vy += this.gravity * dt; this.x += this.vx * dt; this.y += this.vy * dt;
        this.lifespan -= dt;
    }
}

// ---------- REACT COMPONENT ----------
const ShakeSurviveGame: React.FC = () => {
    // --- STATE AND REFS ---
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gameLoopRef = useRef<number>(0);
    const keysRef = useRef<Record<string, boolean>>({});
    
    // UI State
    const [gameState, setGameState] = useState<GameStatus>('ready');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState(1.0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Simulation Refs
    const playerRef = useRef<Player>(new Player(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2));
    const coverObjectsRef = useRef<CoverObject[]>([]);
    const debrisRef = useRef<Debris[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const simStateRef = useRef({
      shakeStart: 0, shakeDuration: 0, choiceStartTime: 0, lastDebrisTime: 0,
      panic: 0, lastTime: now(), mouseTarget: { x: 0, y: 0 }, isMouseControlled: true
    });
    
    // Derived State
    const [health, setHealth] = useState(CONFIG.maxHealth);
    const [panic, setPanic] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);

    // --- GAME LOGIC ---
    const intersectRect = (r1: {x:number, y:number, w:number, h:number}, r2: {x:number, y:number, w:number, h:number}) => {
        return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
    };
    
    const initLevel = useCallback((newLevel = 1) => {
        setLevel(newLevel);
        if (newLevel === 1) setScore(0);

        playerRef.current = new Player(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2);
        coverObjectsRef.current = [];
        debrisRef.current = [];
        particlesRef.current = [];
        
        simStateRef.current = {
            ...simStateRef.current,
            panic: 0, lastDebrisTime: now(), shakeStart: 0,
            mouseTarget: { x: playerRef.current.x, y: playerRef.current.y },
        };
        
        setHealth(CONFIG.maxHealth);
        setPanic(0);
        setHoldProgress(0);

        generateCoverObjects(newLevel);
        setGameState('ready');
    }, []);

    const generateCoverObjects = (currentLevel: number) => {
        const objects: CoverObject[] = [];
        const objectTypes = [
            { type: 'desk', w: 110, h: 54, count: 2 + Math.floor(currentLevel / 3) },
            { type: 'bookshelf', w: 80, h: 180, count: 1 + Math.floor(currentLevel / 2) },
            { type: 'window', w: 120, h: 10, count: 1 },
        ];
        const margins = CONFIG.playAreaMargin;

        const getBoundingBox = (obj: { type: string; x: number; y: number; w: number; h: number; }) => {
            if (obj.type === 'window') return { x: obj.x, y: obj.y, w: obj.w, h: 80 };
            return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
        };

        for (const objType of objectTypes) {
            for (let i = 0; i < objType.count; i++) {
                let newObj, overlaps, attempts = 0;
                do {
                    const x = rand(margins, CONFIG.canvasWidth - margins - objType.w);
                    let y;
                    if (objType.type === 'window') y = 100;
                    else if (objType.type === 'bookshelf') y = rand(CONFIG.canvasHeight - 480, CONFIG.canvasHeight - 380);
                    else y = rand(CONFIG.canvasHeight - 400, CONFIG.canvasHeight - 150);
                    
                    newObj = new CoverObject(x, y, objType.w, objType.h, objType.type);
                    const newObjRect = getBoundingBox(newObj);

                    overlaps = objects.some(existingObj => {
                        const existingObjRect = getBoundingBox(existingObj);
                        const padding = 20;
                        return intersectRect(
                            {x: newObjRect.x - padding, y: newObjRect.y - padding, w: newObjRect.w + padding * 2, h: newObjRect.h + padding * 2},
                            existingObjRect
                        );
                    });
                    attempts++;
                } while (overlaps && attempts < 50);

                if (!overlaps) objects.push(newObj);
            }
        }
        coverObjectsRef.current = objects;
    };
    
    const startChoicePhase = useCallback(() => {
        setGameState('choosing');
        simStateRef.current.choiceStartTime = now();
    }, []);

    const startLevel = useCallback(() => {
        if (gameState === 'ready') {
            startChoicePhase();
        } else if (gameState === 'score') {
            const nextLevel = playerRef.current.health > 0 ? level + 1 : 1;
            initLevel(nextLevel);
            startChoicePhase();
        }
    }, [gameState, level, initLevel, startChoicePhase]);
    
    // --- DRAWING ---
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const p = playerRef.current;
    
        if (gameState === 'shaking') {
            const rem = Math.max(0, (simStateRef.current.shakeStart + simStateRef.current.shakeDuration) - now());
            const amp = 8 * (rem / simStateRef.current.shakeDuration);
            ctx.save();
            ctx.translate(rand(-amp, amp), rand(-amp, amp));
        }
    
        const roundRect = (x:number, y:number, w:number, h:number, r:number, fill=true, stroke=false) => {
          if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
          ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
          if (fill) ctx.fill(); if (stroke) { ctx.stroke(); }
        };

        const drawBackground = () => {
          ctx.save(); 
          ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.fillStyle = '#1e293b'; ctx.fillRect(CONFIG.playAreaMargin, 0, canvas.width - CONFIG.playAreaMargin*2, 150);
          
          const floorGrad = ctx.createLinearGradient(0, 150, 0, canvas.height);
          floorGrad.addColorStop(0, '#334155'); floorGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = floorGrad;
          ctx.fillRect(CONFIG.playAreaMargin, 150, canvas.width - CONFIG.playAreaMargin*2, canvas.height - 150);

          ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
          for(let x=CONFIG.playAreaMargin; x<canvas.width-CONFIG.playAreaMargin; x+=40){ 
             ctx.beginPath(); ctx.moveTo(x,150); ctx.lineTo(x-(x-canvas.width/2)*0.3,canvas.height); ctx.stroke();
          }
          
          ctx.fillStyle = '#020617'; 
          ctx.fillRect(0, 0, CONFIG.playAreaMargin, canvas.height);
          ctx.fillRect(canvas.width - CONFIG.playAreaMargin, 0, CONFIG.playAreaMargin, canvas.height);
          
          ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = 'bold 30px Rajdhani'; ctx.textAlign = 'center';
          ctx.fillText('SAFETY ZONE', canvas.width/2, 80);
          ctx.restore();
        };

        const drawDesk = (d: CoverObject) => {
          ctx.save(); 
          ctx.fillStyle = '#4b5563'; 
          ctx.fillRect(d.x+10, d.y + 10, 8, d.h - 10);
          ctx.fillRect(d.x + d.w - 18, d.y + 10, 8, d.h - 10);
          const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + 15);
          grad.addColorStop(0, d.isSafe ? '#d97706' : '#b91c1c');
          grad.addColorStop(1, '#92400e');
          ctx.fillStyle = grad; 
          ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
          roundRect(d.x, d.y, d.w, 15, 4, true, false);
          
          if(gameState === 'choosing' && d.isSafe) {
             ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.setLineDash([5,5]);
             ctx.strokeRect(d.x-5, d.y-5, d.w+10, d.h+10);
             ctx.setLineDash([]);
          }
          ctx.restore();
        };

        const drawBookshelf = (b: CoverObject) => {
          ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate(b.toppleAngle);
          ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
          
          ctx.fillStyle = '#3f3f46'; ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.fillStyle = '#27272a'; ctx.fillRect(b.x+5, b.y+5, b.w-10, b.h-5);
          
          for(let i = 0; i < 4; i++) { 
             const shelfY = b.y + (b.h/4 * i) + 10;
             ctx.fillStyle = '#52525b'; ctx.fillRect(b.x+5, shelfY + 30, b.w-10, 5);
             for(let j=0; j < 5; j++) {
                if(Math.random() > 0.3) {
                   ctx.fillStyle = `hsl(${rand(190, 220)}, 40%, ${rand(40,60)}%)`;
                   ctx.fillRect(b.x + 10 + j*14, shelfY + 5, 10, 25);
                }
             }
          }
          ctx.strokeStyle = '#18181b'; ctx.lineWidth = 2; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.restore();
        };

        const drawWindow = (w: CoverObject) => {
          ctx.save(); ctx.translate(w.x + w.w / 2, w.y + 40); ctx.rotate(w.toppleAngle * 0.5);
          ctx.translate(-(w.x + w.w / 2), -(w.y + 40));
          
          ctx.fillStyle = 'rgba(147, 197, 253, 0.3)'; ctx.fillRect(w.x, w.y, w.w, 80);
          ctx.strokeStyle = w.isToppling ? '#f87171' : '#475569';
          ctx.lineWidth = 6; ctx.strokeRect(w.x, w.y, w.w, 80);
          ctx.beginPath(); ctx.moveTo(w.x + w.w/2, w.y); ctx.lineTo(w.x + w.w/2, w.y+80); ctx.stroke(); 
          ctx.beginPath(); ctx.moveTo(w.x, w.y + 40); ctx.lineTo(w.x + w.w, w.y + 40); ctx.stroke(); 
          ctx.restore();
        };

        const drawDebris = (d: Debris) => {
          ctx.save(); 
          ctx.translate(d.x, d.y);
          ctx.rotate(now() * 0.005);
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath(); 
          ctx.moveTo(-d.size/2, -d.size/2); ctx.lineTo(d.size/2, -d.size/2); 
          ctx.lineTo(0, d.size/2); ctx.fill();
          ctx.restore();
        };

        const drawPlayer = (pl: Player) => {
          ctx.save(); 
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
          ctx.ellipse(pl.x, pl.y+5, pl.w*0.8, 6, 0, 0, Math.PI*2); ctx.fill();
          
          const shirt = pl.isUnder ? '#38bdf8' : '#0ea5e9'; 
          ctx.fillStyle = shirt;
          roundRect(pl.x-pl.w/2, pl.y-pl.h*0.7, pl.w, pl.h*0.7, 6, true, false);
          
          ctx.fillStyle = '#fca5a5'; 
          ctx.beginPath(); ctx.arc(pl.x, pl.y-pl.h*0.7, pl.w*0.45, 0, Math.PI*2); ctx.fill();
          ctx.restore();
          
          if(pl.isUnder && gameState === 'shaking'){
            ctx.save(); 
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.arc(pl.x, pl.y - pl.h*0.5, 35, 0, Math.PI*2); ctx.stroke();
            
            const safeColor = pl.isUnder.isSafe ? '#4ade80' : '#ef4444'; 
            ctx.strokeStyle = safeColor;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(pl.x, pl.y - pl.h*0.5, 35, -Math.PI/2, -Math.PI/2 + Math.PI*2*pl.holdProgress); 
            ctx.stroke(); 
            ctx.restore();
          }
        };

        const drawParticle = (pa: Particle) => {
          ctx.fillStyle = pa.color; ctx.globalAlpha = clamp(pa.lifespan / 0.5, 0, 1);
          ctx.fillRect(pa.x - pa.size/2, pa.y - pa.size/2, pa.size, pa.size); ctx.globalAlpha = 1.0;
        };

        drawBackground();
        const isUnderDesk = p.isUnder && p.isUnder.type === 'desk';
        
        coverObjectsRef.current.forEach(obj => {
          if (obj.type === 'window' || obj.type === 'bookshelf') {
             if (obj.type === 'bookshelf') drawBookshelf(obj);
             else drawWindow(obj);
          } else if (obj.type === 'desk' && (!isUnderDesk || p.isUnder !== obj)) {
             drawDesk(obj);
          }
        });

        if (isUnderDesk && p.isUnder) {
            drawPlayer(p);
            drawDesk(p.isUnder);
        } else {
            coverObjectsRef.current.forEach(obj => { if (obj.type === 'desk' && p.isUnder !== obj) drawDesk(obj); });
            drawPlayer(p);
        }

        debrisRef.current.forEach(drawDebris);
        particlesRef.current.forEach(drawParticle);
    
        if (gameState === 'shaking') ctx.restore();
        
    }, [gameState]);
    
    // --- UPDATE LOOP ---
    const updateFrame = useCallback(() => {
        const t = now();
        let dt = (t - simStateRef.current.lastTime) / 1000;
        dt = clamp(dt, 0, 0.05);
        simStateRef.current.lastTime = t;
    
        const p = playerRef.current;
        const sim = simStateRef.current;
    
        if (!p.isUnder && gameState !== 'shaking' && gameState !== 'score') {
            let moveX = 0, moveY = 0;
            if (sim.isMouseControlled) {
                moveX = sim.mouseTarget.x - p.x; moveY = sim.mouseTarget.y - p.y;
            } else {
                if(keysRef.current['ArrowLeft'] || keysRef.current['a']) moveX -= 1;
                if(keysRef.current['ArrowRight'] || keysRef.current['d']) moveX += 1;
                if(keysRef.current['ArrowUp'] || keysRef.current['w']) moveY -= 1;
                if(keysRef.current['ArrowDown'] || keysRef.current['s']) moveY += 1;
            }
    
            if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
                const speed = CONFIG.playerSpeed * (1 / difficulty);
                const len = Math.hypot(moveX, moveY) || 1;
                const moveDist = speed * dt;
                if (sim.isMouseControlled && len < moveDist) {
                    p.x += moveX; p.y += moveY;
                } else {
                    p.x += (moveX/len) * moveDist; p.y += (moveY/len) * moveDist;
                }
                p.x = clamp(p.x, CONFIG.playAreaMargin, CONFIG.canvasWidth - CONFIG.playAreaMargin);
                p.y = clamp(p.y, 150, CONFIG.canvasHeight - 20);
            }
        }
    
        if (gameState === 'choosing') {
            // UPDATED: Using choiceDuration (8s)
            const remaining = CONFIG.choiceDuration - (now() - sim.choiceStartTime) / 1000;
            setCountdown(Math.ceil(remaining)); 
            if (remaining <= 0) {
                setGameState('shaking');
                sim.shakeStart = now();
                sim.shakeDuration = CONFIG.shakeDurationBase * (1 + 0.12 * (level-1)) * difficulty * rand(0.85, 1.15);
                sim.lastDebrisTime = now();
            }
        } else if (gameState === 'shaking') {
            const perSec = CONFIG.debrisPerSecond * (1 + 0.15*(level-1)) * difficulty;
            if(now() - sim.lastDebrisTime > 1000 / perSec){
              sim.lastDebrisTime = now();
              const x = rand(CONFIG.playAreaMargin, CONFIG.canvasWidth - CONFIG.playAreaMargin);
              debrisRef.current.push(new Debris(x, -60, rand(-80,80), rand(50,160), rand(10, 30) * (1 + 0.05*level)));
            }
            if(p.isUnder){
              p.holdProgress = clamp(p.holdProgress + dt * (1000 / CONFIG.holdOnDuration), 0, 1);
              sim.panic = clamp(sim.panic - dt*0.6, 0, 1);
            } else {
              sim.panic = clamp(sim.panic + dt*0.18*(1 + (level-1)*0.06), 0, 1);
            }
            
            coverObjectsRef.current.forEach(obj => {
                if (!obj.isSafe && !obj.isToppling && !obj.hasToppled && Math.random() < 0.003 * difficulty) {
                    obj.isToppling = true;
                }
                if (obj.isToppling) {
                    obj.toppleAngle += 2.5 * dt * obj.toppleDirection;
                    if (Math.abs(obj.toppleAngle) >= Math.PI / 2) {
                        obj.isToppling = false; obj.hasToppled = true; obj.toppleAngle = (Math.PI / 2) * obj.toppleDirection;
                        particlesRef.current.push(...Array(15).fill(0).map(() => new Particle(obj.x + obj.w / 2, obj.y + obj.h / 2, '#4a3423')));
                        const dist = Math.hypot(p.x - (obj.x + obj.w / 2), p.y - (obj.y + obj.h / 2));
                        
                        // UPDATED: Instant Game Over on Topple Hit
                        if (dist < obj.h * 0.7) { 
                            p.health = 0; 
                            sim.panic = 1;
                            setGameState('score');
                        }
                    }
                }
            });
            
            debrisRef.current.forEach(d => {
              d.update(dt);
              if(!d.alive) return;
              if(intersectRect(d.rect(), p.rect())){
                
                // UPDATED: Collision Logic
                if (p.isUnder && p.isUnder.isSafe) {
                    // Safe under desk: Chip damage only
                    p.health -= 2; 
                    particlesRef.current.push(...Array(3).fill(0).map(() => new Particle(d.x, d.y, '#94a3b8')));
                } else {
                    // Exposed: Instant Game Over
                    p.health = 0;
                    sim.panic = 1;
                    setGameState('score');
                }
                
                d.alive = false;
              } else if (d.y > CONFIG.canvasHeight) {
                  d.alive = false;
              }
            });
            debrisRef.current = debrisRef.current.filter(d=>d.alive);

            if (now() - sim.shakeStart >= sim.shakeDuration) {
                setGameState('score');
                if (p.health > 0) {
                    setScore(s => s + Math.round(1000 + p.health * 2 + (1 - sim.panic) * 200));
                }
            }
        }
    
        particlesRef.current.forEach(p => p.update(dt));
        particlesRef.current = particlesRef.current.filter(p => p.lifespan > 0);
    
        if (p.health <= 0 && gameState !== 'score') {
            p.health = 0;
            setGameState('score');
        }
        
        setHealth(p.health);
        setPanic(sim.panic);
        setHoldProgress(p.holdProgress);
    }, [gameState, level, difficulty]);
    
    // --- LEADERBOARD & EVENTS ---
    useEffect(() => {
        try {
            const raw = localStorage.getItem('shake_survive_leaderboard') || '[]';
            setLeaderboard(JSON.parse(raw));
        } catch (e) { setLeaderboard([]); }
    }, []);

    const saveScore = () => {
        const name = playerName.trim() || 'Survivor';
        const newList = [...leaderboard, { name, score: Math.round(score), level, ts: Date.now() }];
        newList.sort((a, b) => b.score - a.score);
        const finalList = newList.slice(0, 10);
        localStorage.setItem('shake_survive_leaderboard', JSON.stringify(finalList));
        setLeaderboard(finalList);
    };

    useEffect(() => {
        const mainLoop = () => {
            updateFrame();
            draw();
            gameLoopRef.current = requestAnimationFrame(mainLoop);
        };
        gameLoopRef.current = requestAnimationFrame(mainLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [draw, updateFrame]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'a', 'ArrowRight', 'd', 'ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) {
                simStateRef.current.isMouseControlled = false;
            }
            keysRef.current[e.key] = true;
            if (e.key === 'Enter' && (gameState === 'ready' || gameState === 'score')) { startLevel(); }
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                onInteract();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };

        const onInteract = () => {
            if (gameState === 'choosing' || gameState === 'shaking') {
                tryTakeCover();
            } else if (gameState === 'ready' || gameState === 'score') {
                startLevel();
            }
        };

        const tryTakeCover = () => {
            const p = playerRef.current;
            let best: CoverObject | null = null; 
            let bestD = Infinity;
            for(const obj of coverObjectsRef.current){
                const cx = obj.x + obj.w/2, cy = obj.y + obj.h/2;
                const dist = Math.hypot(cx - p.x, cy - p.y);
                if(dist < bestD){ bestD = dist; best = obj; }
            }
            if(best && bestD < best.safeRadius + 10){
                p.x = best.x + best.w/2; p.y = best.y + best.h + p.h/2 - 8;
                p.isUnder = best; p.holdProgress = 0;
            } else {
                simStateRef.current.panic = clamp(simStateRef.current.panic + 0.08, 0, 1);
            }
        };

        const canvas = canvasRef.current;
        const handleMouseMove = (e: MouseEvent) => {
            simStateRef.current.isMouseControlled = true;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            simStateRef.current.mouseTarget.x = (e.clientX - rect.left) * scaleX;
            simStateRef.current.mouseTarget.y = (e.clientY - rect.top) * scaleY;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas?.addEventListener('mousemove', handleMouseMove);
        canvas?.addEventListener('click', onInteract);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas?.removeEventListener('mousemove', handleMouseMove);
            canvas?.removeEventListener('click', onInteract);
        };
    }, [gameState, startLevel]);

    useEffect(() => { initLevel(1); }, [initLevel]);


    // --- UI RENDER ---
    return (
        <>
            <style>{modernStyles}</style>
            <div className="game-wrapper">
                
                {/* CANVAS AREA */}
                <div className="viewport-container">
                    <canvas ref={canvasRef} width="1200" height="720" />

                    {gameState === 'choosing' && (
                        <div className="game-overlay" style={{ pointerEvents: 'none', background: 'transparent' }}>
                            <div className="countdown">{countdown}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'uppercase', textShadow: '0 0 10px black' }}>Find Cover!</div>
                        </div>
                    )}
                    
                    {gameState === 'shaking' && (
                         <div className="shake-warning">Earthquake! Hold On!</div>
                    )}

                    {gameState === 'ready' && (
                        <div className="game-overlay">
                            <div className="overlay-content">
                                <h1 className="big-title">SHAKE SURVIVE</h1>
                                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                                    Drill Protocol: Find a safe spot (Desk). 
                                    Any direct hit from debris is FATAL.
                                </p>
                                <button className="btn-primary" onClick={startLevel}>Initiate Drill (Level {level})</button>
                            </div>
                        </div>
                    )}

                    {gameState === 'score' && (
                        <div className="game-overlay">
                            <div className="overlay-content">
                                <h1 className="big-title" style={{ background: health > 0 ? 'var(--accent)' : 'var(--danger)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {health > 0 ? 'SURVIVED' : 'GAME OVER'}
                                </h1>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>
                                    Score: {Math.round(score)}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-primary" onClick={startLevel}>
                                        {health > 0 ? 'Next Level' : 'Retry Simulation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SIDEBAR HUD */}
                <aside className="sidebar">
                    <div className="panel">
                        <div className="panel-header">Vital Signs</div>
                        
                        <div className="meter-group">
                            <div className="meter-label"><span>Health</span> <span>{Math.round(health)}%</span></div>
                            <div className="meter-track">
                                <div className="meter-fill bg-health" style={{ width: `${clamp(health / CONFIG.maxHealth * 100, 0, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="meter-group">
                            <div className="meter-label"><span>Panic Level</span> <span>{Math.round(panic * 100)}%</span></div>
                            <div className="meter-track">
                                <div className="meter-fill bg-panic" style={{ width: `${clamp(panic * 100, 0, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="meter-group">
                            <div className="meter-label"><span>Hold Integrity</span> <span>{Math.round(holdProgress * 100)}%</span></div>
                            <div className="meter-track">
                                <div className="meter-fill bg-hold" style={{ width: `${Math.round(holdProgress * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">Mission Data</div>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-val">{level}</div>
                                <div className="stat-lbl">Level</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-val">{Math.round(score)}</div>
                                <div className="stat-lbl">Score</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-val">{difficulty}x</div>
                                <div className="stat-lbl">Difficulty</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-val">{gameState === 'shaking' ? 'ACTIVE' : 'IDLE'}</div>
                                <div className="stat-lbl">Status</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header">Settings & Logs</div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label className="meter-label">Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(parseFloat(e.target.value))}>
                                <option value="0.9">Easy</option>
                                <option value="1.0">Normal</option>
                                <option value="1.15">Hard</option>
                                <option value="1.3">Extreme</option>
                            </select>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div className="meter-label">Top Survivors</div>
                            <ul className="leaderboard-list">
                                {leaderboard.length > 0 ? leaderboard.map((item, i) => (
                                    <li key={item.ts} className="leaderboard-item">
                                        <span><span className="rank-badge">#{i+1}</span> {item.name}</span>
                                        <span style={{color:'var(--accent)'}}>{item.score}</span>
                                    </li>
                                )) : <li style={{padding: '10px', color: 'var(--text-muted)', textAlign: 'center'}}>No records found</li>}
                            </ul>
                        </div>

                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <input 
                                value={playerName} 
                                onChange={e => setPlayerName(e.target.value)} 
                                placeholder="Enter Name" 
                            />
                            <button className="btn-secondary" onClick={saveScore}>Save</button>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default ShakeSurviveGame;