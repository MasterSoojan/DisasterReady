"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameExit } from "../GameExit";

// ---------- ICONS ----------

// ---------- CSS STYLES ----------
import { useLeaderboard, saveLeaderboard } from "./leaderboard";
import { drawScene } from "./render";
import { modernStyles } from "./styles";
import {
  CONFIG,
  createCoverObjects,
  rand,
  clamp,
  now,
  Player,
  CoverObject,
  Debris,
  Particle,
  intersectRect,
} from "./engine";
import type { GameStatus } from "./engine";

// ---------- REACT COMPONENT ----------
const ShakeSurviveGame: React.FC = () => {
  // --- STATE AND REFS ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});

  // UI State
  const [gameState, setGameState] = useState<GameStatus>("ready");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1.0);
  const leaderboard = useLeaderboard();
  const [saveStatus, setSaveStatus] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Simulation Refs
  const playerRef = useRef<Player>(
    new Player(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2),
  );
  const coverObjectsRef = useRef<CoverObject[]>([]);
  const debrisRef = useRef<Debris[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const simStateRef = useRef({
    shakeStart: 0,
    shakeDuration: 0,
    choiceStartTime: 0,
    lastDebrisTime: 0,
    panic: 0,
    lastTime: now(),
    mouseTarget: { x: 0, y: 0 },
    isMouseControlled: true,
  });

  // Derived State
  const [health, setHealth] = useState(CONFIG.maxHealth);
  const [panic, setPanic] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);

  // --- GAME LOGIC ---
  const initLevel = useCallback((newLevel = 1) => {
    setLevel(newLevel);
    if (newLevel === 1) setScore(0);

    playerRef.current = new Player(
      CONFIG.canvasWidth / 2,
      CONFIG.canvasHeight / 2,
    );
    coverObjectsRef.current = [];
    debrisRef.current = [];
    particlesRef.current = [];

    simStateRef.current = {
      ...simStateRef.current,
      panic: 0,
      lastDebrisTime: now(),
      shakeStart: 0,
      mouseTarget: { x: playerRef.current.x, y: playerRef.current.y },
    };

    setHealth(CONFIG.maxHealth);
    setPanic(0);
    setHoldProgress(0);

    coverObjectsRef.current = createCoverObjects(newLevel);
    setGameState("ready");
  }, []);

  const startChoicePhase = useCallback(() => {
    setGameState("choosing");
    simStateRef.current.choiceStartTime = now();
  }, []);

  const startLevel = useCallback(() => {
    if (gameState === "ready") {
      startChoicePhase();
    } else if (gameState === "score") {
      const nextLevel = playerRef.current.health > 0 ? level + 1 : 1;
      initLevel(nextLevel);
      startChoicePhase();
    }
  }, [gameState, level, initLevel, startChoicePhase]);

  // --- DRAWING ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas)
      drawScene(canvas, {
        player: playerRef.current,
        covers: coverObjectsRef.current,
        debris: debrisRef.current,
        particles: particlesRef.current,
        status: gameState,
        timing: simStateRef.current,
      });
  }, [gameState]);

  // --- UPDATE LOOP ---
  const updateFrame = useCallback(() => {
    const t = now();
    let dt = (t - simStateRef.current.lastTime) / 1000;
    dt = clamp(dt, 0, 0.05);
    simStateRef.current.lastTime = t;

    const p = playerRef.current;
    const sim = simStateRef.current;

    if (!p.isUnder && gameState !== "shaking" && gameState !== "score") {
      let moveX = 0,
        moveY = 0;
      if (sim.isMouseControlled) {
        moveX = sim.mouseTarget.x - p.x;
        moveY = sim.mouseTarget.y - p.y;
      } else {
        if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) moveX -= 1;
        if (keysRef.current["ArrowRight"] || keysRef.current["d"]) moveX += 1;
        if (keysRef.current["ArrowUp"] || keysRef.current["w"]) moveY -= 1;
        if (keysRef.current["ArrowDown"] || keysRef.current["s"]) moveY += 1;
      }

      if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
        const speed = CONFIG.playerSpeed * (1 / difficulty);
        const len = Math.hypot(moveX, moveY) || 1;
        const moveDist = speed * dt;
        if (sim.isMouseControlled && len < moveDist) {
          p.x += moveX;
          p.y += moveY;
        } else {
          p.x += (moveX / len) * moveDist;
          p.y += (moveY / len) * moveDist;
        }
        p.x = clamp(
          p.x,
          CONFIG.playAreaMargin,
          CONFIG.canvasWidth - CONFIG.playAreaMargin,
        );
        p.y = clamp(p.y, 150, CONFIG.canvasHeight - 20);
      }
    }

    if (gameState === "choosing") {
      // UPDATED: Using choiceDuration (8s)
      const remaining =
        CONFIG.choiceDuration - (now() - sim.choiceStartTime) / 1000;
      setCountdown(Math.ceil(remaining));
      if (remaining <= 0) {
        setGameState("shaking");
        sim.shakeStart = now();
        sim.shakeDuration =
          CONFIG.shakeDurationBase *
          (1 + 0.12 * (level - 1)) *
          difficulty *
          rand(0.85, 1.15);
        sim.lastDebrisTime = now();
      }
    } else if (gameState === "shaking") {
      const perSec =
        CONFIG.debrisPerSecond * (1 + 0.15 * (level - 1)) * difficulty;
      if (now() - sim.lastDebrisTime > 1000 / perSec) {
        sim.lastDebrisTime = now();
        const x = rand(
          CONFIG.playAreaMargin,
          CONFIG.canvasWidth - CONFIG.playAreaMargin,
        );
        debrisRef.current.push(
          new Debris(
            x,
            -60,
            rand(-80, 80),
            rand(50, 160),
            rand(10, 30) * (1 + 0.05 * level),
          ),
        );
      }
      if (p.isUnder) {
        p.holdProgress = clamp(
          p.holdProgress + dt * (1000 / CONFIG.holdOnDuration),
          0,
          1,
        );
        sim.panic = clamp(sim.panic - dt * 0.6, 0, 1);
      } else {
        sim.panic = clamp(
          sim.panic + dt * 0.18 * (1 + (level - 1) * 0.06),
          0,
          1,
        );
      }

      coverObjectsRef.current.forEach((obj) => {
        if (
          !obj.isSafe &&
          !obj.isToppling &&
          !obj.hasToppled &&
          Math.random() < 0.003 * difficulty
        ) {
          obj.isToppling = true;
        }
        if (obj.isToppling) {
          obj.toppleAngle += 2.5 * dt * obj.toppleDirection;
          if (Math.abs(obj.toppleAngle) >= Math.PI / 2) {
            obj.isToppling = false;
            obj.hasToppled = true;
            obj.toppleAngle = (Math.PI / 2) * obj.toppleDirection;
            particlesRef.current.push(
              ...Array(15)
                .fill(0)
                .map(
                  () =>
                    new Particle(
                      obj.x + obj.w / 2,
                      obj.y + obj.h / 2,
                      "#4a3423",
                    ),
                ),
            );
            const dist = Math.hypot(
              p.x - (obj.x + obj.w / 2),
              p.y - (obj.y + obj.h / 2),
            );

            // UPDATED: Instant Game Over on Topple Hit
            if (dist < obj.h * 0.7) {
              p.health = 0;
              sim.panic = 1;
              setGameState("score");
            }
          }
        }
      });

      debrisRef.current.forEach((d) => {
        d.update(dt);
        if (!d.alive) return;
        if (intersectRect(d.rect(), p.rect())) {
          // UPDATED: Collision Logic
          if (p.isUnder && p.isUnder.isSafe) {
            // Safe under desk: Chip damage only
            p.health -= 2;
            particlesRef.current.push(
              ...Array(3)
                .fill(0)
                .map(() => new Particle(d.x, d.y, "#94a3b8")),
            );
          } else {
            // Exposed: Instant Game Over
            p.health = 0;
            sim.panic = 1;
            setGameState("score");
          }

          d.alive = false;
        } else if (d.y > CONFIG.canvasHeight) {
          d.alive = false;
        }
      });
      debrisRef.current = debrisRef.current.filter((d) => d.alive);

      if (now() - sim.shakeStart >= sim.shakeDuration) {
        setGameState("score");
        if (p.health > 0) {
          setScore(
            (s) => s + Math.round(1000 + p.health * 2 + (1 - sim.panic) * 200),
          );
        }
      }
    }

    particlesRef.current.forEach((p) => p.update(dt));
    particlesRef.current = particlesRef.current.filter((p) => p.lifespan > 0);

    if (p.health <= 0 && gameState !== "score") {
      p.health = 0;
      setGameState("score");
    }

    setHealth(p.health);
    setPanic(sim.panic);
    setHoldProgress(p.holdProgress);
  }, [gameState, level, difficulty]);

  // --- LEADERBOARD & EVENTS ---
  const saveScore = () => {
    const name = playerName.trim() || "Survivor";
    const newList = [
      ...leaderboard,
      { name, score: Math.round(score), level, ts: Date.now() },
    ];
    newList.sort((a, b) => b.score - a.score);
    const finalList = newList.slice(0, 10);
    setSaveStatus(
      saveLeaderboard(finalList)
        ? "Score saved on this device."
        : "Storage unavailable; score could not be saved.",
    );
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
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName))
        return;
      if (
        [
          "ArrowLeft",
          "a",
          "ArrowRight",
          "d",
          "ArrowUp",
          "w",
          "ArrowDown",
          "s",
        ].includes(e.key)
      ) {
        simStateRef.current.isMouseControlled = false;
      }
      keysRef.current[e.key] = true;
      if (
        e.key === "Enter" &&
        (gameState === "ready" || gameState === "score")
      ) {
        startLevel();
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        onInteract();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    const handleBlur = () => {
      keysRef.current = {};
    };

    const onInteract = () => {
      if (gameState === "choosing" || gameState === "shaking") {
        tryTakeCover();
      } else if (gameState === "ready" || gameState === "score") {
        startLevel();
      }
    };

    const tryTakeCover = () => {
      const p = playerRef.current;
      let best: CoverObject | null = null;
      let bestD = Infinity;
      for (const obj of coverObjectsRef.current) {
        const cx = obj.x + obj.w / 2,
          cy = obj.y + obj.h / 2;
        const dist = Math.hypot(cx - p.x, cy - p.y);
        if (dist < bestD) {
          bestD = dist;
          best = obj;
        }
      }
      if (best && bestD < best.safeRadius + 10) {
        p.x = best.x + best.w / 2;
        p.y = best.y + best.h + p.h / 2 - 8;
        p.isUnder = best;
        p.holdProgress = 0;
      } else {
        simStateRef.current.panic = clamp(
          simStateRef.current.panic + 0.08,
          0,
          1,
        );
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    canvas?.addEventListener("mousemove", handleMouseMove);
    canvas?.addEventListener("click", onInteract);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      canvas?.removeEventListener("mousemove", handleMouseMove);
      canvas?.removeEventListener("click", onInteract);
    };
  }, [gameState, startLevel]);

  useEffect(() => {
    coverObjectsRef.current = createCoverObjects(1);
  }, []);

  // --- UI RENDER ---
  return (
    <>
      <GameExit />
      <style>{modernStyles}</style>
      <div className="game-wrapper">
        {/* CANVAS AREA */}
        <div className="viewport-container">
          <canvas
            ref={canvasRef}
            width="1200"
            height="720"
            aria-label="Shake Survive playfield"
          />

          {gameState === "choosing" && (
            <div
              className="game-overlay"
              style={{ pointerEvents: "none", background: "transparent" }}
            >
              <div className="countdown">{countdown}</div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textShadow: "0 0 10px black",
                }}
              >
                Find Cover!
              </div>
            </div>
          )}

          {gameState === "shaking" && (
            <div className="shake-warning">Earthquake! Hold On!</div>
          )}

          {gameState === "ready" && (
            <div className="game-overlay">
              <div className="overlay-content">
                <h1 className="big-title">SHAKE SURVIVE</h1>
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                  Drill Protocol: Find a safe spot (Desk). Any direct hit from
                  debris is FATAL.
                </p>
                <button className="btn-primary" onClick={startLevel}>
                  Initiate Drill (Level {level})
                </button>
              </div>
            </div>
          )}

          {gameState === "score" && (
            <div className="game-overlay">
              <div className="overlay-content">
                <h1
                  className="big-title"
                  style={{
                    background: health > 0 ? "var(--accent)" : "var(--danger)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {health > 0 ? "SURVIVED" : "GAME OVER"}
                </h1>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "20px",
                  }}
                >
                  Score: {Math.round(score)}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-primary" onClick={startLevel}>
                    {health > 0 ? "Next Level" : "Retry Simulation"}
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
              <div className="meter-label">
                <span>Health</span> <span>{Math.round(health)}%</span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill bg-health"
                  style={{
                    width: `${clamp((health / CONFIG.maxHealth) * 100, 0, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="meter-group">
              <div className="meter-label">
                <span>Panic Level</span> <span>{Math.round(panic * 100)}%</span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill bg-panic"
                  style={{ width: `${clamp(panic * 100, 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="meter-group">
              <div className="meter-label">
                <span>Hold Integrity</span>{" "}
                <span>{Math.round(holdProgress * 100)}%</span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill bg-hold"
                  style={{ width: `${Math.round(holdProgress * 100)}%` }}
                ></div>
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
                <div className="stat-val">
                  {gameState === "shaking" ? "ACTIVE" : "IDLE"}
                </div>
                <div className="stat-lbl">Status</div>
              </div>
            </div>
          </div>

          <div
            className="panel"
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="panel-header">Settings & Logs</div>

            <div style={{ marginBottom: "15px" }}>
              <label className="meter-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseFloat(e.target.value))}
              >
                <option value="0.9">Easy</option>
                <option value="1.0">Normal</option>
                <option value="1.15">Hard</option>
                <option value="1.3">Extreme</option>
              </select>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div className="meter-label">Top Survivors</div>
              <ul className="leaderboard-list">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item, i) => (
                    <li key={item.ts} className="leaderboard-item">
                      <span>
                        <span className="rank-badge">#{i + 1}</span> {item.name}
                      </span>
                      <span style={{ color: "var(--accent)" }}>
                        {item.score}
                      </span>
                    </li>
                  ))
                ) : (
                  <li
                    style={{
                      padding: "10px",
                      color: "var(--text-muted)",
                      textAlign: "center",
                    }}
                  >
                    No records found
                  </li>
                )}
              </ul>
            </div>

            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter Name"
              />
              <button className="btn-secondary" onClick={saveScore}>
                Save
              </button>
              <span role="status">{saveStatus}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ShakeSurviveGame;
