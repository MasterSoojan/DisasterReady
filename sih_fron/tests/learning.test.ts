import { afterEach, expect, it, vi } from "vitest";
import { modules } from "../src/features/modules/data";
import {
  initialModuleSession,
  moduleSession,
} from "../src/features/modules/session";
import { drills } from "../src/features/drills/data";
import {
  initialDrillSession,
  drillSession,
  hasRequiredSteps,
} from "../src/features/drills/session";
import {
  initialQuizSession,
  quizSession,
} from "../src/features/games/quiz/session";
import { quizData } from "../src/features/games/quiz/questions";
import { createDrillAudio } from "../src/features/drills/audio";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps authored modules/drills complete and internally consistent without certifying their claims", () => {
  expect(modules).toHaveLength(4);
  expect(drills).toHaveLength(3);
  expect(new Set(modules.map((item) => item.id)).size).toBe(4);
  for (const lesson of modules) {
    expect(lesson.steps).toHaveLength(3);
    expect(lesson.quiz.options[lesson.quiz.answer]).toBeTruthy();
  }
  for (const drill of drills) {
    expect(drill.steps).toHaveLength(5);
    expect(drill.steps.filter((step) => step.correct)).toHaveLength(3);
    expect(drill.steps.filter((step) => !step.correct)).toHaveLength(2);
  }
});

it("module steps, wrong answers, completion, back and skipping have explicit transitions", () => {
  for (const lesson of modules) {
    let state = moduleSession(initialModuleSession, {
      type: "start",
      id: lesson.id,
    });
    expect(moduleSession(state, { type: "back" }).stepIndex).toBe(0);
    expect(
      moduleSession(state, { type: "answer", index: lesson.quiz.answer }),
    ).toBe(state);
    for (let i = 0; i < lesson.steps.length; i++)
      state = moduleSession(state, { type: "next" });
    expect(state.phase).toBe("quiz");
    state = moduleSession(state, {
      type: "answer",
      index: (lesson.quiz.answer + 1) % lesson.quiz.options.length,
    });
    expect(state.phase).toBe("quiz");
    expect(state.feedback).toContain("Not quite");
    expect(moduleSession(state, { type: "answer", index: -1 })).toBe(state);
    expect(moduleSession(state, { type: "back" })).toMatchObject({
      stepIndex: 2,
      phase: "learning",
      feedback: "",
    });
    expect(moduleSession(state, { type: "exit" })).toEqual(
      initialModuleSession,
    );
    state = moduleSession(state, { type: "answer", index: lesson.quiz.answer });
    expect(state.phase).toBe("complete");
    expect(
      moduleSession(state, { type: "answer", index: lesson.quiz.answer }),
    ).toBe(state);
    expect(
      moduleSession(state, { type: "start", id: lesson.id }),
    ).toMatchObject({ stepIndex: 0, phase: "learning", feedback: "" });
  }
  expect(
    moduleSession(initialModuleSession, { type: "start", id: "missing" }),
  ).toBe(initialModuleSession);
});

it("quiz awards at most one point per question and cannot advance unanswered or submit twice", () => {
  let state = initialQuizSession;
  for (const [index, question] of quizData.entries()) {
    expect(quizSession(state, { type: "next" })).toBe(state);
    expect(
      quizSession(state, { type: "answer", option: "not an option" }),
    ).toBe(state);
    state = quizSession(state, { type: "answer", option: question.answer });
    expect(
      quizSession(state, { type: "answer", option: question.answer }),
    ).toBe(state);
    expect(state.score).toBe(index + 1);
    state = quizSession(state, { type: "next" });
  }
  expect(state).toMatchObject({ score: quizData.length, submitted: true });
  expect(quizSession(state, { type: "next" })).toBe(state);
  expect(quizSession(state, { type: "retake" })).toEqual(initialQuizSession);
  const wrong = quizData[0].options.find(
    (value) => value !== quizData[0].answer,
  )!;
  expect(
    quizSession(initialQuizSession, { type: "answer", option: wrong }).score,
  ).toBe(0);
});

it("drills preserve scoring and penalties, reject duplicate/invalid choices, and require all correct steps", () => {
  for (const drill of drills) {
    let state = drillSession(initialDrillSession, {
      type: "start",
      id: drill.id,
      now: 100,
    });
    expect(drillSession(state, { type: "finish", now: 100 }).status).toBe(
      "playing",
    );
    expect(drillSession(state, { type: "choose", index: 100, now: 100 })).toBe(
      state,
    );
    const wrong = drill.steps.findIndex((step) => !step.correct);
    state = drillSession(state, { type: "choose", index: wrong, now: 100 });
    expect(state).toMatchObject({ score: 0, timeLeft: 55 });
    for (const [index, step] of drill.steps.entries()) {
      if (!step.correct) continue;
      state = drillSession(state, { type: "choose", index, now: 100 });
      expect(drillSession(state, { type: "choose", index, now: 100 })).toBe(
        state,
      );
    }
    expect(state.score).toBe(300);
    expect(hasRequiredSteps(state, drill)).toBe(true);
    state = drillSession(state, { type: "choose", index: wrong, now: 100 });
    expect(state).toMatchObject({ score: 250, timeLeft: 50 });
    state = drillSession(state, { type: "finish", now: 100 });
    expect(state.status).toBe("completed");
    expect(drillSession(state, { type: "tick", now: 100000 })).toBe(state);
    expect(
      drillSession(state, { type: "choose", index: wrong, now: 100 }),
    ).toBe(state);
    expect(drillSession(state, { type: "stop" })).toEqual(initialDrillSession);
  }
});

it("a throttled tick or click checks the actual deadline; finish cannot bypass expiry", () => {
  const drill = drills[0];
  let state = drillSession(initialDrillSession, {
    type: "start",
    id: drill.id,
    now: 500,
  });
  for (const [index, step] of drill.steps.entries())
    if (step.correct)
      state = drillSession(state, { type: "choose", index, now: 500 });
  expect(drillSession(state, { type: "tick", now: 60499 }).timeLeft).toBe(1);
  expect(drillSession(state, { type: "finish", now: 60500 }).status).toBe(
    "expired",
  );
  expect(
    drillSession(state, { type: "choose", index: 1, now: 90000 }),
  ).toMatchObject({ status: "expired", score: 300, timeLeft: 0 });
  const expired = drillSession(state, { type: "tick", now: 90000 });
  expect(drillSession(expired, { type: "finish", now: 90001 })).toBe(expired);
  expect(
    drillSession(expired, { type: "start", id: drill.id, now: 90001 }),
  ).toMatchObject({
    score: 0,
    timeLeft: 60,
    selectedSteps: [],
    status: "playing",
  });
});

it("wrong-choice penalties can end a drill, while invalid starts/timestamps are ignored", () => {
  const drill = drills[0];
  let state = drillSession(initialDrillSession, {
    type: "start",
    id: drill.id,
    now: 0,
  });
  const wrong = drill.steps.findIndex((step) => !step.correct);
  state = drillSession(state, { type: "choose", index: wrong, now: 58000 });
  expect(state).toMatchObject({
    status: "expired",
    score: 0,
    timeLeft: 0,
    feedback: null,
  });
  expect(drillSession(state, { type: "start", id: "missing", now: 0 })).toBe(
    state,
  );
  expect(drillSession(state, { type: "start", id: drill.id, now: NaN })).toBe(
    state,
  );
});

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  static mode: "playing" | "reject" | "stall" = "playing";
  loop = false;
  volume = 0;
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  constructor(public src: string) {
    super();
    FakeAudio.instances.push(this);
  }
  play() {
    if (FakeAudio.mode === "reject")
      return Promise.reject(new Error("Unavailable"));
    if (FakeAudio.mode === "stall") return new Promise<void>(() => {});
    return Promise.resolve();
  }
}
function fakeAudio(mode: typeof FakeAudio.mode = "playing") {
  vi.useFakeTimers();
  FakeAudio.instances = [];
  FakeAudio.mode = mode;
  vi.stubGlobal("Audio", FakeAudio);
}

it("owns every background/effect audio node and releases it on ended/dispose", async () => {
  fakeAudio();
  const fail = vi.fn();
  const audio = createDrillAudio("/sounds/siren.mp3", fail);
  audio.playEffect("correct");
  audio.playEffect("wrong");
  await Promise.resolve();
  expect(vi.getTimerCount()).toBe(0);
  expect(FakeAudio.instances[0].loop).toBe(true);
  FakeAudio.instances[1].dispatchEvent(new Event("ended"));
  audio.dispose();
  audio.dispose();
  audio.playEffect("win");
  expect(FakeAudio.instances).toHaveLength(3);
  for (const instance of FakeAudio.instances) {
    expect(instance.pause).toHaveBeenCalledTimes(1);
    expect(instance.removeAttribute).toHaveBeenCalledWith("src");
    expect(instance.load).toHaveBeenCalledTimes(1);
    instance.dispatchEvent(new Event("error"));
  }
  expect(fail).not.toHaveBeenCalled();
});

it("audio failures and eight-second stalls fail visibly without leaking timers or late callbacks", async () => {
  fakeAudio("reject");
  const fail = vi.fn();
  createDrillAudio("/missing.mp3", fail);
  await Promise.resolve();
  expect(fail).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
  fakeAudio("stall");
  const stalled = createDrillAudio("/stalled.mp3", fail);
  await vi.advanceTimersByTimeAsync(8000);
  expect(fail).toHaveBeenCalledTimes(2);
  expect(FakeAudio.instances[0].pause).toHaveBeenCalledTimes(1);
  stalled.dispose();
  const cancelled = createDrillAudio("/cancelled.mp3", fail);
  cancelled.dispose();
  await vi.advanceTimersByTimeAsync(10000);
  expect(fail).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
});
