"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  currentDemoUser,
  decodeAccountSnapshot,
  DEMO_ACCOUNT_EVENT,
  DEMO_ACCOUNT_KEY,
  readAccountSnapshot,
} from "./demoUsers";

function subscribe(notify: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (
      event.key === null ||
      [DEMO_ACCOUNT_KEY, "users", "currentUser"].includes(event.key)
    )
      notify();
  };
  window.addEventListener("storage", storageChanged);
  window.addEventListener(DEMO_ACCOUNT_EVENT, notify);
  return () => {
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener(DEMO_ACCOUNT_EVENT, notify);
  };
}
function snapshot() {
  try {
    return readAccountSnapshot(localStorage);
  } catch {
    return "unavailable";
  }
}
export function useDemoAccounts() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    if (raw === null)
      return { loading: true, users: [], user: null, error: null };
    try {
      if (raw === "unavailable")
        throw new Error(
          "Browser storage is unavailable. Demo accounts cannot be loaded.",
        );
      const state = decodeAccountSnapshot(raw);
      return {
        loading: false,
        users: state.users,
        user: currentDemoUser(state),
        error: null,
      };
    } catch (failure) {
      return {
        loading: false,
        users: [],
        user: null,
        error:
          failure instanceof Error
            ? failure.message
            : "Unable to read local demo accounts.",
      };
    }
  }, [raw]);
}
