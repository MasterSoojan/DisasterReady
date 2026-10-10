"use client";

import { useSyncExternalStore } from "react";

const eventName = "disasterready:theme";
let fallback = false;

function readTheme() {
  try {
    return localStorage.getItem("darkMode") === "true";
  } catch {
    return fallback;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === "darkMode" || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, onChange);
  };
}

function setDarkMode(value: boolean) {
  fallback = value;
  try {
    localStorage.setItem("darkMode", String(value));
  } catch {
    // Privacy mode can disable storage; the current tab can still change theme.
  }
  window.dispatchEvent(new Event(eventName));
}

/** One persisted preference across routes, without overwriting it during hydration. */
export function useDarkMode() {
  const darkMode = useSyncExternalStore(subscribe, readTheme, () => false);
  return [darkMode, setDarkMode] as const;
}
