import { modules } from "./data";

export type ModuleSession = {
  moduleId: string | null;
  stepIndex: number;
  phase: "learning" | "quiz" | "complete";
  feedback: string;
};
export const initialModuleSession: ModuleSession = {
  moduleId: null,
  stepIndex: 0,
  phase: "learning",
  feedback: "",
};
type Action =
  | { type: "start"; id: string }
  | { type: "next" | "back" | "exit" }
  | { type: "answer"; index: number };

export function moduleSession(
  state: ModuleSession,
  action: Action,
): ModuleSession {
  if (action.type === "exit") return initialModuleSession;
  if (action.type === "start")
    return modules.some((item) => item.id === action.id)
      ? { ...initialModuleSession, moduleId: action.id }
      : state;
  const lesson = modules.find((item) => item.id === state.moduleId);
  if (!lesson) return state;
  if (action.type === "next" && state.phase === "learning")
    return state.stepIndex < lesson.steps.length - 1
      ? { ...state, stepIndex: state.stepIndex + 1 }
      : { ...state, phase: "quiz" };
  if (action.type === "back")
    return {
      ...state,
      phase: "learning",
      feedback: "",
      stepIndex:
        state.phase === "learning"
          ? Math.max(0, state.stepIndex - 1)
          : state.stepIndex,
    };
  if (
    action.type === "answer" &&
    state.phase === "quiz" &&
    Number.isInteger(action.index) &&
    lesson.quiz.options[action.index]
  ) {
    return action.index === lesson.quiz.answer
      ? { ...state, phase: "complete", feedback: "" }
      : { ...state, feedback: "Not quite. Review the lesson and try again." };
  }
  return state;
}
