"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { drills, type Drill } from "./data";
import { drillSession, initialDrillSession, hasRequiredSteps } from "./session";
import { createDrillAudio } from "./audio";

export function useDrill() {
  const [state, dispatch] = useReducer(drillSession, initialDrillSession);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<ReturnType<typeof createDrillAudio> | null>(null);
  const selectedDrill =
    drills.find((drill) => drill.id === state.drillId) ?? null;

  useEffect(() => {
    if (state.status !== "playing") return;
    const timer = setInterval(
      () => dispatch({ type: "tick", now: performance.now() }),
      250,
    );
    return () => clearInterval(timer);
  }, [state.status]);

  useEffect(() => {
    if (!selectedDrill || !audioEnabled) return;
    const owned = createDrillAudio(
      state.status === "playing" ? selectedDrill.bgSound : null,
      () => setAudioError(true),
    );
    audio.current = owned;
    return () => {
      owned.dispose();
      if (audio.current === owned) audio.current = null;
    };
  }, [selectedDrill, audioEnabled, state.status]);

  useEffect(() => {
    if (!state.feedback) return;
    audio.current?.playEffect(state.feedback.kind);
    if (state.feedback.kind !== "wrong")
      void confetti({
        particleCount: state.feedback.kind === "win" ? 200 : 30,
        spread: state.feedback.kind === "win" ? 150 : 50,
        origin: { y: 0.8 },
        disableForReducedMotion: true,
      });
  }, [state.feedback]);
  useEffect(
    () => () => {
      confetti.reset();
    },
    [],
  );

  return {
    ...state,
    selectedDrill,
    audioEnabled,
    audioError,
    canFinish:
      !!selectedDrill &&
      state.status === "playing" &&
      hasRequiredSteps(state, selectedDrill),
    start: (drill: Drill) => {
      confetti.reset();
      setAudioError(false);
      dispatch({ type: "start", id: drill.id, now: performance.now() });
    },
    stop: () => {
      confetti.reset();
      dispatch({ type: "stop" });
    },
    choose: (index: number) =>
      dispatch({ type: "choose", index, now: performance.now() }),
    finish: () => dispatch({ type: "finish", now: performance.now() }),
    toggleAudio: () => setAudioEnabled((value) => !value),
  };
}
