"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- TypeScript Interfaces ---
type GameState = 'start' | 'playing' | 'gameOver' | 'win';

interface GameObject {
    x: number;
    y: number;
}

interface Player extends GameObject {
    health: number;
    smokeLevel: number;
    hasExtinguisher: boolean;
    hasKey: boolean;
    width: number;
    height: number;
}

interface Fire extends GameObject {
    size: number;
}

interface Item extends GameObject {
    collected: boolean;
}

interface LockedDoor extends GameObject {
    unlocked: boolean;
}

interface Particle extends GameObject {
    vx: number;
    vy: number;
    life: number;
    color: string;
}

// --- Game Constants ---
const TILE_SIZE = 40;
const PLAYER_SPEED = 2;
const FIRE_SPREAD_RATE = 0.005;
const SMOKE_INCREASE_RATE = 0.01;
const DAMAGE_RATE_FIRE = 0.5;
const DAMAGE_RATE_SMOKE = 0.1;
const MEDKIT_HEAL_AMOUNT = 50;

const levelDesigns = [
    // Level 1: Introduction
    [
        "WWWWWWWWWWWWWWWWWWWW",
        "W P      W         W",
        "W        W  F      W",
        "W WWWWW  W  F      W",
        "W W   W  W         W",
        "W   E W  WWWWWWWW  W",
        "W W   W            W",
        "W WWWWWWWWWWWW     W",
        "W    F             W",
        "W    F         F   W",
        "W WWWWWWWWWWWWWWWW W",
        "W                  W",
        "W      F           W",
        "W         X        W",
        "WWWWWWWWWWWWWWWWWWWW",
    ],
    // Level 2: Key and Door
    [
        "WWWWWWWWWWWWWWWWWWWW",
        "W P      F       F W",
        "W WWWWWWWWWWWWWWWW W",
        "W F   K        F   W",
        "W W WWWWWWWWWWWW W W",
        "W W F      W L W W W",
        "W WWWWWWWW W W W W W",
        "W E F      W W W X W",
        "W WWWWWWWW W WWWWWWW",
        "W          W       W",
        "W F WWWWWWWWWWWWWW W",
        "W W H            F W",
        "W WWWWWWWWWWWWWWWW W",
        "W F                W",
        "WWWWWWWWWWWWWWWWWWWW",
    ],
    // Level 3: Redesigned
    [
        "WWWWWWWWWWWWWWWWWWWW",
        "W      L X         W",
        "W WWWWWWWWWWWWWWWW W",
        "W W K        F   W W",
        "W W WWWWWWWWWWWW W W",
        "W W            W W W",
        "W WWWWWWWWWW F W W W",
        "W   H    W   F W   W",
        "W WWWWWW W WWWWWWW W",
        "W      W W         W",
        "W F FF W W WWWWWWWWW",
        "W      W   E       W",
        "W WWWWWWWWWWWWWWWW W",
        "W P                W",
        "WWWWWWWWWWWWWWWWWWWW",
    ]
];


// --- Main App Component ---
const App = () => {
    // --- State Management ---
    const [gameState, setGameState] = useState<GameState>('start');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [player, setPlayer] = useState<Player | null>(null);
    const [message, setMessage] = useState('');
    const [soundsReady, setSoundsReady] = useState(false);

    // --- Refs for non-render state ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const gameLoopRef = useRef<number>();
    const isGameOverRef = useRef(false);
    
    // Using refs for game objects that are frequently updated inside the loop
    // to avoid performance issues with state updates
    const levelRef = useRef<boolean[][]>([]);
    const firesRef = useRef<Fire[]>([]);
    const extinguisherRef = useRef<Item | null>(null);
    const exitRef = useRef<GameObject | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const gameKeysRef = useRef<Item[]>([]);
    const lockedDoorsRef = useRef<LockedDoor[]>([]);
    const medkitsRef = useRef<Item[]>([]);
    const playerRef = useRef<Player | null>(null);
    const isDamageSoundPlayingRef = useRef(false);

    // --- Sound Engine (Tone.js) ---
    const soundsRef = useRef<any>(null); // Initialize as null
    const isSprayingSoundRef = useRef(false);

    // --- Game Logic Functions (wrapped in useCallback) ---

    const init = useCallback((levelIndex: number, keepHealth?: number) => {
        isGameOverRef.current = false;
        const levelMap = levelDesigns[levelIndex];
        const newLevel: boolean[][] = [];
        const newFires: Fire[] = [];
        const newParticles: Particle[] = [];
        const newGameKeys: Item[] = [];
        const newLockedDoors: LockedDoor[] = [];
        const newMedkits: Item[] = [];
        let newExtinguisher: Item | null = null;
        let newExit: GameObject | null = null;
        
        const initialPlayer: Player = {
            x: 0, y: 0,
            health: 100, // keepHealth || 100,
            smokeLevel: 0,
            hasExtinguisher: false,
            hasKey: false,
            width: TILE_SIZE * 0.6,
            height: TILE_SIZE * 0.6
        };

        levelMap.forEach((row, y) => {
            newLevel[y] = [];
            row.split('').forEach((char, x) => {
                newLevel[y][x] = (char === 'W' || char === 'L');
                switch (char) {
                    case 'P':
                        initialPlayer.x = x * TILE_SIZE + TILE_SIZE / 2;
                        initialPlayer.y = y * TILE_SIZE + TILE_SIZE / 2;
                        break;
                    case 'F':
                        newFires.push({ x, y, size: TILE_SIZE });
                        break;
                    case 'E':
                        newExtinguisher = { x, y, collected: false };
                        break;
                    case 'X':
                        newExit = { x, y };
                        break;
                    case 'K':
                        newGameKeys.push({ x, y, collected: false });
                        break;
                    case 'L':
                        newLockedDoors.push({ x, y, unlocked: false });
                        break;
                    case 'H':
                        newMedkits.push({ x, y, collected: false });
                        break;
                }
            });
        });

        // Update refs
        levelRef.current = newLevel;
        firesRef.current = newFires;
        particlesRef.current = newParticles;
        gameKeysRef.current = newGameKeys;
        lockedDoorsRef.current = newLockedDoors;
        medkitsRef.current = newMedkits;
        extinguisherRef.current = newExtinguisher;
        exitRef.current = newExit;
        playerRef.current = initialPlayer;
        
        // Update state
        setPlayer(initialPlayer);
        setCurrentLevelIndex(levelIndex);
    }, []);
    
    const isBlocked = useCallback((x: number, y: number, ignoreDoors = false): boolean => {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        const level = levelRef.current;

        if (!level || !level[tileY] || tileX < 0 || tileX >= level[0].length || tileY < 0 || tileY >= level.length) {
            return true;
        }
        if (ignoreDoors) {
            return levelDesigns[currentLevelIndex][tileY][tileX] === 'W';
        }
        return level[tileY][tileX];
    }, [currentLevelIndex]);
    
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Level
        const level = levelRef.current;
        for (let y = 0; y < level.length; y++) {
            for (let x = 0; x < level[y].length; x++) {
                if (level[y][x]) {
                    ctx.fillStyle = '#4a5568';
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
        
        // Draw Items
        const drawEmoji = (emoji: string, item: GameObject, color: string) => {
            ctx.fillStyle = color;
            ctx.font = `${TILE_SIZE * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, item.x * TILE_SIZE + TILE_SIZE / 2, item.y * TILE_SIZE + TILE_SIZE / 2);
        };

        if (extinguisherRef.current && !extinguisherRef.current.collected) drawEmoji('🧯', extinguisherRef.current, 'white');
        gameKeysRef.current.forEach(key => !key.collected && drawEmoji('🔑', key, 'yellow'));
        lockedDoorsRef.current.forEach(door => !door.unlocked && drawEmoji('🔒', door, 'red'));
        medkitsRef.current.forEach(medkit => !medkit.collected && drawEmoji('✚', medkit, 'lightgreen'));
        if (exitRef.current) drawEmoji('🚪', exitRef.current, 'hsl(120, 50%, 70%)');

        // Draw Fires
        firesRef.current.forEach(fire => {
            const flicker = Math.random() * 0.2 + 0.9;
            const size = fire.size * flicker;
            const grad = ctx.createRadialGradient(
                fire.x * TILE_SIZE + fire.size / 2, fire.y * TILE_SIZE + fire.size / 2, size * 0.1,
                fire.x * TILE_SIZE + fire.size / 2, fire.y * TILE_SIZE + fire.size / 2, size * 0.5
            );
            grad.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
            grad.addColorStop(0.6, 'rgba(255, 100, 0, 0.7)');
            grad.addColorStop(1, 'rgba(200, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fire.x * TILE_SIZE + fire.size / 2, fire.y * TILE_SIZE + fire.size / 2, size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Player
        if (playerRef.current) {
            const p = playerRef.current;
            ctx.fillStyle = 'cyan';
            ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
        }

        // Draw Particles
        particlesRef.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

    }, []);
    
    // --- Game State Changer ---
    const changeGameState = (newState: GameState) => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        
        setGameState(newState);
        if (newState === 'playing') {
             init(0);
        } else if (newState === 'gameOver' && soundsRef.current) {
            soundsRef.current.lose.triggerAttackRelease("C2", "2");
        } else if (newState === 'win' && soundsRef.current) {
            soundsRef.current.win.triggerAttackRelease("C5", "1");
        }
    };

    const gameLoop = useCallback(() => {
        if (isGameOverRef.current || !playerRef.current) return;
        
        const p = playerRef.current;
        const keys = keysRef.current;
        let dx = 0;
        let dy = 0;

        // --- Update Player Position ---
        if (keys['ArrowUp'] || keys['w']) dy -= PLAYER_SPEED;
        if (keys['ArrowDown'] || keys['s']) dy += PLAYER_SPEED;
        if (keys['ArrowLeft'] || keys['a']) dx -= PLAYER_SPEED;
        if (keys['ArrowRight'] || keys['d']) dx += PLAYER_SPEED;

        if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
        }

        const newX = p.x + dx;
        const newY = p.y + dy;

        if (!isBlocked(newX + (dx > 0 ? p.width / 2 : -p.width / 2), p.y - p.height / 2) &&
            !isBlocked(newX + (dx > 0 ? p.width / 2 : -p.width / 2), p.y + p.height / 2)) {
            p.x = newX;
        }
        if (!isBlocked(p.x - p.width / 2, newY + (dy > 0 ? p.height / 2 : -p.height / 2)) &&
            !isBlocked(p.x + p.width / 2, newY + (dy > 0 ? p.height / 2 : -p.height / 2))) {
            p.y = newY;
        }

        // --- Update Fire ---
        firesRef.current.forEach(fire => {
            if (Math.random() < FIRE_SPREAD_RATE) {
                const neighbors = [ { x: fire.x + 1, y: fire.y }, { x: fire.x - 1, y: fire.y }, { x: fire.x, y: fire.y + 1 }, { x: fire.x, y: fire.y - 1 }];
                const validNeighbors = neighbors.filter(n => !isBlocked(n.x * TILE_SIZE, n.y * TILE_SIZE, true) && !firesRef.current.some(f => f.x === n.x && f.y === n.y));
                if (validNeighbors.length > 0) {
                    const newFirePos = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                    firesRef.current.push({ ...newFirePos, size: TILE_SIZE });
                }
            }
        });

        // --- Update Smoke ---
        p.smokeLevel = Math.min(100, p.smokeLevel + firesRef.current.length * SMOKE_INCREASE_RATE);
        
        // --- Update Interactions ---
        const playerTileX = Math.floor(p.x / TILE_SIZE);
        const playerTileY = Math.floor(p.y / TILE_SIZE);
        let healthChanged = false;

        if (firesRef.current.some(f => f.x === playerTileX && f.y === playerTileY)) {
            p.health -= DAMAGE_RATE_FIRE;
            healthChanged = true;
            if (!isDamageSoundPlayingRef.current && soundsRef.current) {
                isDamageSoundPlayingRef.current = true;
                soundsRef.current.damage.triggerAttackRelease("8n");
                setTimeout(() => { isDamageSoundPlayingRef.current = false; }, 200);
            }
            if(canvasRef.current) {
                canvasRef.current.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
                setTimeout(() => { if(canvasRef.current) canvasRef.current.style.transform = '' }, 100);
            }
        }
        if (p.smokeLevel > 50) {
            p.health -= (p.smokeLevel / 100) * DAMAGE_RATE_SMOKE;
            healthChanged = true;
        }

        const showMessage = (text: string) => {
            setMessage(text);
            setTimeout(() => setMessage(''), 3000);
        };

        if (extinguisherRef.current && !extinguisherRef.current.collected && playerTileX === extinguisherRef.current.x && playerTileY === extinguisherRef.current.y) {
            extinguisherRef.current.collected = true;
            p.hasExtinguisher = true;
            showMessage("Fire Extinguisher Acquired! CLICK to use.");
            if (soundsRef.current) soundsRef.current.pickup.triggerAttackRelease("C5", "0.2");
        }

        gameKeysRef.current.forEach(key => {
            if (!key.collected && playerTileX === key.x && playerTileY === key.y) {
                key.collected = true;
                p.hasKey = true;
                showMessage("Key Acquired!");
                 if (soundsRef.current) soundsRef.current.pickup.triggerAttackRelease("G5", "0.2");
            }
        });
        
        medkitsRef.current.forEach(medkit => {
            if (!medkit.collected && playerTileX === medkit.x && playerTileY === medkit.y) {
                medkit.collected = true;
                p.health = Math.min(100, p.health + MEDKIT_HEAL_AMOUNT);
                healthChanged = true;
                showMessage("Health Recovered!");
                 if (soundsRef.current) soundsRef.current.pickup.triggerAttackRelease("A5", "0.3");
            }
        });
        
        if (p.hasKey) {
            for (const door of lockedDoorsRef.current) {
                const dx = p.x - (door.x * TILE_SIZE + TILE_SIZE / 2);
                const dy = p.y - (door.y * TILE_SIZE + TILE_SIZE / 2);
                if (!door.unlocked && Math.sqrt(dx * dx + dy * dy) < TILE_SIZE) {
                    door.unlocked = true;
                    levelRef.current[door.y][door.x] = false;
                    p.hasKey = false;
                     if (soundsRef.current) soundsRef.current.door_unlock.triggerAttackRelease("C4", "0.1");
                    break;
                }
            }
        }
        
        // --- Win/Lose Conditions ---
        if (exitRef.current && playerTileX === exitRef.current.x && playerTileY === exitRef.current.y) {
            if (currentLevelIndex < levelDesigns.length - 1) {
                setCurrentLevelIndex(prev => prev + 1);
            } else {
                isGameOverRef.current = true;
                changeGameState('win');
                return; 
            }
        }
        
        if (p.health <= 0) {
            p.health = 0;
            healthChanged = true;
            isGameOverRef.current = true;
            changeGameState('gameOver');
            return;
        }

        // --- Update Particles ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const particle = particlesRef.current[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            if (particle.life <= 0) particlesRef.current.splice(i, 1);
        }
        
        // --- Final State Update ---
        if (healthChanged || p.hasExtinguisher !== player?.hasExtinguisher || p.hasKey !== player?.hasKey) {
           setPlayer({ ...p });
        }
        
        draw();
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [draw, isBlocked, currentLevelIndex, player, init]);
    
    // --- Event Handlers ---
    const handleStart = () => {
        const Tone = (window as any).Tone;
        if (!soundsReady || !Tone) return;
        isGameOverRef.current = false;
        Tone.start();
        changeGameState('playing');
    };

    const handleUseExtinguisher = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameState !== 'playing' || !playerRef.current?.hasExtinguisher || !canvasRef.current || !soundsRef.current) return;

        const p = playerRef.current;
        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const clickTileX = Math.floor(clickX / TILE_SIZE);
        const clickTileY = Math.floor(clickY / TILE_SIZE);

        const playerTileX = Math.floor(p.x / TILE_SIZE);
        const playerTileY = Math.floor(p.y / TILE_SIZE);

        const dx = clickTileX - playerTileX;
        const dy = clickTileY - playerTileY;

        if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) {
            firesRef.current = firesRef.current.filter(f => !(f.x === clickTileX && f.y === clickTileY));
            for (let i = 0; i < 20; i++) {
                particlesRef.current.push({
                    x: p.x, y: p.y,
                    vx: (Math.random() - 0.5 + dx * 0.5) * 4,
                    vy: (Math.random() - 0.5 + dy * 0.5) * 4,
                    life: 30, color: `rgba(200, 220, 255, ${Math.random() * 0.5 + 0.5})`
                });
            }
            if (!isSprayingSoundRef.current) {
                soundsRef.current.spray.triggerAttack();
                isSprayingSoundRef.current = true;
            }
        }
    };
    
    const handleMouseUp = () => {
        if (isSprayingSoundRef.current && soundsRef.current) {
            soundsRef.current.spray.triggerRelease();
            isSprayingSoundRef.current = false;
        }
    };
    
    // --- Effects ---

    // Load Tone.js and initialize sounds
    useEffect(() => {
        const scriptId = 'tone-js-script';
        if (document.getElementById(scriptId)) {
            setSoundsReady(true);
            return;
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js';
        script.async = true;
        script.onload = () => {
            const Tone = (window as any).Tone;
            if (Tone) {
                soundsRef.current = {
                    damage: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0 } }).toDestination(),
                    pickup: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 } }).toDestination(),
                    spray: new Tone.NoiseSynth({ noise: { type: 'white' }, volume: -20, envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 } }).toDestination(),
                    win: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.5 } }).toDestination(),
                    lose: new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.2, decay: 1, sustain: 0, release: 0.5 } }).toDestination(),
                    door_unlock: new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 } }).toDestination()
                };
                setSoundsReady(true);
            }
        };
        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);
    
    // Game loop starter
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);
    
    // Level transition
    useEffect(() => {
      if (gameState === 'playing') {
        init(currentLevelIndex, playerRef.current?.health);
      }
    }, [currentLevelIndex, gameState, init]);

    // Keyboard and resize listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
        
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const levelMap = levelDesigns[currentLevelIndex];
            canvas.width = levelMap[0].length * TILE_SIZE;
            canvas.height = levelMap.length * TILE_SIZE;
            draw();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [currentLevelIndex, draw]);

    // --- Render JSX ---
    const getHealthBarColor = () => {
        if (!player || player.health > 50) return 'bg-green-500';
        if (player.health > 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-gray-900 text-white flex flex-col justify-center items-center min-h-screen overflow-hidden font-mono">
             <style>{`
                body { touch-action: none; }
                .progress-bar-container { background-color: rgba(255, 255, 255, 0.2); border-radius: 9999px; overflow: hidden; }
                .progress-bar { transition: width 0.3s ease-in-out; }
            `}</style>

            {gameState === 'playing' && player && (
                <div id="game-ui" className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 w-full max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/50 p-3 rounded-lg backdrop-blur-sm">
                        <h1 className="text-xl font-bold text-orange-400">Blaze Escape</h1>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">LEVEL {currentLevelIndex + 1}</span>
                            {player.hasKey && <span className="text-2xl" title="Key Acquired">🔑</span>}
                        </div>
                        <div className="w-full sm:w-1/3">
                            <span className="text-sm font-semibold">HEALTH</span>
                            <div className="progress-bar-container">
                                <div className={`progress-bar h-4 ${getHealthBarColor()} rounded-full`} style={{ width: `${player.health}%` }}></div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/3">
                            <span className="text-sm font-semibold">SMOKE LEVEL</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar h-4 bg-gray-400 rounded-full" style={{ width: `${player.smokeLevel}%` }}></div>
                            </div>
                        </div>
                    </div>
                    {message && <p className="text-center mt-4 text-lg font-bold text-yellow-300 animate-pulse">{message}</p>}
                </div>
            )}

            <canvas 
                ref={canvasRef} 
                className="bg-[#1a1a1a] cursor-crosshair rounded-lg max-w-[90vw] max-h-[calc(100vh-150px)] object-contain"
                onMouseDown={handleUseExtinguisher}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {gameState === 'start' && (
                <div id="startScreen" className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20 text-center p-4">
                    <h1 className="text-5xl font-bold mb-4 text-orange-500 tracking-wider">BLAZE ESCAPE</h1>
                    <p className="text-lg mb-6 max-w-md">You've woken up in a burning building. Find the fire extinguisher and get to the exit before it's too late!</p>
                    <div className="mb-4">
                        <h2 className="font-bold text-xl mb-2">Controls:</h2>
                        <p><kbd className="px-2 py-1 bg-gray-700 rounded">ARROW KEYS</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded">WASD</kbd> to move.</p>
                        <p><kbd className="px-2 py-1 bg-gray-700 rounded">CLICK</kbd> to use the fire extinguisher.</p>
                    </div>
                    <button 
                        onClick={handleStart} 
                        disabled={!soundsReady}
                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {soundsReady ? 'START' : 'Loading Audio...'}
                    </button>
                </div>
            )}

            {(gameState === 'gameOver' || gameState === 'win') && (
                 <div id="gameOverScreen" className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center z-20 text-center p-4">
                    <h1 className={`text-6xl font-bold mb-4 ${gameState === 'win' ? 'text-green-500' : 'text-red-600'}`}>
                        {gameState === 'win' ? 'YOU ESCAPED!' : 'GAME OVER'}
                    </h1>
                    <p className="text-xl mb-8">
                        {gameState === 'win' ? 'You made it out alive. Congratulations!' : 'The fire consumed you.'}
                    </p>
                    <button onClick={handleStart} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105">
                        RETRY
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;

