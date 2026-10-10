import { drills, type Drill } from "./data";

export const DRILL_SECONDS = 60;
export type DrillSession = {
  drillId: string | null;
  status: "idle" | "playing" | "expired" | "completed";
  selectedSteps: number[];
  score: number;
  timeLeft: number;
  deadline: number;
  message: string;
  feedback: { kind: "correct" | "wrong" | "win"; index: number } | null;
};
export const initialDrillSession: DrillSession = {
  drillId: null,
  status: "idle",
  selectedSteps: [],
  score: 0,
  timeLeft: DRILL_SECONDS,
  deadline: 0,
  message: "Pick a practice scenario.",
  feedback: null,
};
type Action =
  | { type: "start"; id: string; now: number }
  | { type: "stop" }
  | { type: "tick"; now: number }
  | { type: "finish"; now: number }
  | { type: "choose"; index: number; now: number };

export function hasRequiredSteps(state: DrillSession, drill: Drill): boolean {
  return drill.steps.every(
    (step, index) => !step.correct || state.selectedSteps.includes(index),
  );
}

function advanceTime(state: DrillSession, now: number): DrillSession {
  const timeLeft = Math.max(
    0,
    Math.min(DRILL_SECONDS, Math.ceil((state.deadline - now) / 1000)),
  );
  if (timeLeft === 0)
    return {
      ...state,
      timeLeft,
      status: "expired",
      message: "Time is up. Review the steps and try again.",
      feedback: null,
    };
  return timeLeft === state.timeLeft ? state : { ...state, timeLeft };
}

/** Existing +100 / -50 / -5 seconds rules; a monotonic deadline also covers throttled tabs. */
export function drillSession(
  state: DrillSession,
  action: Action,
): DrillSession {
  if (action.type === "stop") return initialDrillSession;
  if (!Number.isFinite(action.now)) return state;
  if (action.type === "start")
    return drills.some((drill) => drill.id === action.id)
      ? {
          ...initialDrillSession,
          drillId: action.id,
          status: "playing",
          deadline: action.now + DRILL_SECONDS * 1000,
          message: "Select the appropriate steps for this practice scenario.",
        }
      : state;
  if (state.status !== "playing") return state;
  const drill = drills.find((item) => item.id === state.drillId);
  if (!drill) return state;
  const current = advanceTime(state, action.now);
  if (current.status === "expired" || action.type === "tick") return current;
  if (action.type === "finish")
    return hasRequiredSteps(current, drill)
      ? {
          ...current,
          status: "completed",
          message: "Practice complete. This is not a safety qualification.",
          feedback: { kind: "win", index: -1 },
        }
      : current;
  const step = drill.steps[action.index];
  if (
    !Number.isInteger(action.index) ||
    !step ||
    current.selectedSteps.includes(action.index)
  )
    return current;
  if (step.correct)
    return {
      ...current,
      selectedSteps: [...current.selectedSteps, action.index],
      score: current.score + 100,
      message: "Correct for this scenario. Continue with the remaining steps.",
      feedback: { kind: "correct", index: action.index },
    };
  return advanceTime(
    {
      ...current,
      score: Math.max(0, current.score - 50),
      deadline: current.deadline - 5000,
      message: `Review this choice: ${step.hint}`,
      feedback: { kind: "wrong", index: action.index },
    },
    action.now,
  );
}
