"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { LeaderboardEntry } from "./engine";

const key = "shake_survive_leaderboard";
const changed = "disasterready:shake-scores";

export function parseLeaderboard(raw: string | null): LeaderboardEntry[] {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(values)) return [];
    return values
      .filter(
        (value): value is LeaderboardEntry =>
          typeof value === "object" &&
          value !== null &&
          typeof value.name === "string" &&
          Number.isFinite(value.score) &&
          Number.isFinite(value.level) &&
          Number.isFinite(value.ts),
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}

function snapshot() {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changed, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changed, onChange);
  };
}

export function useLeaderboard() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseLeaderboard(raw), [raw]);
}

export function saveLeaderboard(entries: LeaderboardEntry[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
    window.dispatchEvent(new Event(changed));
    return true;
  } catch {
    return false;
  }
}
