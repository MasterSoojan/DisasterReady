import { quizData } from "./questions";

export type QuizSession = {
  currentQ: number;
  score: number;
  submitted: boolean;
  selectedOption: string | null;
};
export const initialQuizSession: QuizSession = {
  currentQ: 0,
  score: 0,
  submitted: false,
  selectedOption: null,
};
type Action = { type: "answer"; option: string } | { type: "next" | "retake" };

export function quizSession(state: QuizSession, action: Action): QuizSession {
  if (action.type === "retake") return initialQuizSession;
  if (state.submitted) return state;
  const question = quizData[state.currentQ];
  if (!question) return state;
  if (
    action.type === "answer" &&
    state.selectedOption === null &&
    question.options.includes(action.option)
  ) {
    return {
      ...state,
      selectedOption: action.option,
      score: state.score + Number(action.option === question.answer),
    };
  }
  if (action.type === "next" && state.selectedOption !== null)
    return state.currentQ + 1 < quizData.length
      ? { ...state, currentQ: state.currentQ + 1, selectedOption: null }
      : { ...state, submitted: true };
  return state;
}
