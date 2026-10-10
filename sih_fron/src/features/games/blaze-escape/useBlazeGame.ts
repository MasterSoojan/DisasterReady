"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { levelDesigns, TILE_SIZE, type GameState, type Player } from "./config";
import {
  canvasPoint,
  createLevel,
  sprayAt,
  stepWorld,
  type BlazeWorld,
} from "./engine";
import { drawWorld } from "./render";
import { createSounds, loadTone } from "./sound";
import type { GameSounds, ToneLibrary } from "./audio";

export function useBlazeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<BlazeWorld | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const soundsRef = useRef<GameSounds | null>(null);
  const toneRef = useRef<ToneLibrary | null>(null);
  const sprayingRef = useRef(false);
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentLevelIndex, setLevel] = useState(0);
  const [player, setPlayer] = useState<Player | null>(null);
  const [message, setMessage] = useState("");
  const [audioStatus, setAudioStatus] = useState("Loading optional audio…");

  const stopSpray = useCallback(() => {
    if (sprayingRef.current) soundsRef.current?.spray.triggerRelease();
    sprayingRef.current = false;
  }, []);

  useEffect(() => {
    let active = true;
    void loadTone().then((tone) => {
      if (!active) return;
      toneRef.current = tone;
      try {
        if (tone) soundsRef.current = createSounds(tone);
        setAudioStatus(
          tone ? "Audio available" : "Audio unavailable — play without sound",
        );
      } catch {
        setAudioStatus("Audio unavailable — play without sound");
      }
    });
    return () => {
      active = false;
      stopSpray();
      Object.values(soundsRef.current ?? {}).forEach((sound) =>
        sound.dispose(),
      );
      soundsRef.current = null;
    };
  }, [stopSpray]);

  const startLevel = useCallback(
    (index: number) => {
      stopSpray();
      const world = createLevel(index);
      worldRef.current = world;
      setLevel(index);
      // React receives a snapshot, not the mutable simulation object.
      setPlayer({ ...world.player });
      setMessage("");
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = levelDesigns[index][0].length * TILE_SIZE;
        canvas.height = levelDesigns[index].length * TILE_SIZE;
        drawWorld(canvas, world);
      }
    },
    [stopSpray],
  );

  const handleStart = () => {
    keysRef.current = {};
    void toneRef.current
      ?.start()
      .catch(() => setAudioStatus("Audio blocked — play without sound"));
    startLevel(0);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    const mountedCanvas = canvasRef.current;
    let frame = 0;
    let previous = performance.now(),
      accumulated = 0,
      lastHud = 0,
      lastDamageSound = -200;
    let messageExpires = 0;
    const tick = (time: number) => {
      const world = worldRef.current;
      const canvas = canvasRef.current;
      if (!world || !canvas) return;
      // Keep the original 60 Hz rules independent of monitor refresh rate.
      accumulated += Math.min(time - previous, 100);
      previous = time;
      while (accumulated >= 1000 / 60) {
        accumulated -= 1000 / 60;
        const events = stepWorld(world, keysRef.current);
        for (const sound of events.sounds)
          soundsRef.current?.[sound.name].triggerAttackRelease(
            sound.note,
            sound.duration,
          );
        if (events.hurt && time - lastDamageSound >= 200) {
          soundsRef.current?.damage.triggerAttackRelease("8n");
          lastDamageSound = time;
        }
        canvas.style.transform = events.hurt
          ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`
          : "";
        if (events.messages.length) {
          setMessage(events.messages.at(-1)!);
          messageExpires = time + 3000;
        }
        if (events.outcome === "nextLevel") {
          startLevel(world.levelIndex + 1);
          accumulated = 0;
          break;
        }
        if (events.outcome) {
          stopSpray();
          setPlayer({ ...world.player });
          setGameState(events.outcome);
          soundsRef.current?.[
            events.outcome === "win" ? "win" : "lose"
          ].triggerAttackRelease(events.outcome === "win" ? "C5" : "C2", "1");
          return;
        }
      }
      if (messageExpires && time >= messageExpires) {
        setMessage("");
        messageExpires = 0;
      }
      if (time - lastHud >= 100) {
        setPlayer({ ...worldRef.current!.player });
        lastHud = time;
      }
      drawWorld(canvas, worldRef.current!);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (mountedCanvas) mountedCanvas.style.transform = "";
    };
  }, [gameState, startLevel, stopSpray]);

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement)?.tagName)
      )
        return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      )
        event.preventDefault();
      keysRef.current[
        event.key.toLowerCase().length === 1
          ? event.key.toLowerCase()
          : event.key
      ] = true;
    };
    const onUp = (event: KeyboardEvent) => {
      keysRef.current[
        event.key.toLowerCase().length === 1
          ? event.key.toLowerCase()
          : event.key
      ] = false;
    };
    const onBlur = () => {
      keysRef.current = {};
      stopSpray();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pointerup", stopSpray);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pointerup", stopSpray);
    };
  }, [stopSpray]);

  const handleUseExtinguisher = (event: PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    const canvas = canvasRef.current;
    if (gameState !== "playing" || !world || !canvas) return;
    const point = canvasPoint(
      event.clientX,
      event.clientY,
      canvas.getBoundingClientRect(),
      canvas,
    );
    if (sprayAt(world, point.x, point.y) && !sprayingRef.current) {
      soundsRef.current?.spray.triggerAttack();
      sprayingRef.current = true;
    }
  };

  return {
    canvasRef,
    gameState,
    currentLevelIndex,
    player,
    message,
    audioStatus,
    handleStart,
    handleUseExtinguisher,
    handleMouseUp: stopSpray,
  };
}
