import { scenarios, type Choice } from "./scenarios";

export interface FireRun {
  health: number;
  visibility: number;
  currentScenarioId: string;
  outcome: "win" | "loss" | null;
  feedback: { text: string; type: "correct" | "wrong" | null };
  choices: Choice[];
}

export function createRun(): FireRun {
  return {
    health: 100,
    visibility: 100,
    currentScenarioId: "start",
    outcome: null,
    feedback: { text: "", type: null },
    choices: [...scenarios.start.choices],
  };
}

/** Choice effects and the resulting scene form a single, testable transition. */
export function takeChoice(
  run: FireRun,
  choice: Choice,
  random = Math.random,
): FireRun {
  if (!run.choices.includes(choice)) return run;
  if (choice.next === "reset") return createRun();
  if (run.outcome || !scenarios[choice.next]) return run;
  const health = Math.max(0, run.health + (choice.consequences?.health ?? 0));
  const visibility = Math.max(
    0,
    run.visibility + (choice.consequences?.visibility ?? 0),
  );
  const scene = scenarios[choice.next];
  const choices = [...scene.choices];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {
    health,
    visibility,
    currentScenarioId: choice.next,
    outcome: scene.outcome ?? (health <= 0 || visibility <= 0 ? "loss" : null),
    feedback: choice.correct
      ? { text: choice.correct, type: "correct" }
      : choice.wrong
        ? { text: choice.wrong, type: "wrong" }
        : { text: "", type: null },
    choices,
  };
}
