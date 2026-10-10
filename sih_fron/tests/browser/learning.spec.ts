import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { modules } from "../../src/features/modules/data";
import { drills } from "../../src/features/drills/data";
import { quizData } from "../../src/features/games/quiz/questions";

type AudioNode = { src: string; paused: boolean; loop: boolean; loads: number };
declare global {
  interface Window {
    __drillAudio: { nodes: AudioNode[]; mode: "playing" | "reject" | "stall" };
    __drillTimers: Set<number>;
  }
}

async function installAudio(
  page: Page,
  mode: "playing" | "reject" | "stall" = "playing",
) {
  await page.addInitScript((mode) => {
    const state = { nodes: [] as AudioNode[], mode };
    window.__drillAudio = state;
    class FixtureAudio extends EventTarget {
      loop = false;
      volume = 0;
      paused = true;
      loads = 0;
      constructor(public src: string) {
        super();
        state.nodes.push(this);
      }
      play() {
        if (state.mode === "reject")
          return Promise.reject(new Error("Fixture sound blocked"));
        if (state.mode === "stall") return new Promise<void>(() => {});
        this.paused = false;
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
      }
      removeAttribute(name: string) {
        if (name === "src") this.src = "";
      }
      load() {
        this.loads++;
      }
    }
    Object.defineProperty(window, "Audio", { value: FixtureAudio });
    const timers = new Set<number>();
    window.__drillTimers = timers;
    const originalSet = window.setInterval.bind(window);
    const originalClear = window.clearInterval.bind(window);
    window.setInterval = ((
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ) => {
      const id = originalSet(handler, timeout, ...args);
      if (timeout === 250) timers.add(id);
      return id;
    }) as typeof window.setInterval;
    window.clearInterval = ((id?: number) => {
      if (id !== undefined) timers.delete(id);
      originalClear(id);
    }) as typeof window.clearInterval;
  }, mode);
}

test.use({ hasTouch: true });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("every module supports keyboard entry, wrong-answer feedback, completion and reset", async ({
  page,
}) => {
  await page.goto("/modules");
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs++;
    await dialog.dismiss();
  });
  for (const lesson of modules) {
    const card = page.getByRole("button", { name: new RegExp(lesson.name) });
    await card.focus();
    await page.keyboard.press("Enter");
    for (const [index, step] of lesson.steps.entries()) {
      await expect(
        page.getByRole("heading", { name: step.title, exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: index === lesson.steps.length - 1 ? "Take Quiz" : "Next Step",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: lesson.quiz.question, exact: true }),
    ).toBeVisible();
    const wrong = (lesson.quiz.answer + 1) % lesson.quiz.options.length;
    await page
      .getByRole("button", { name: lesson.quiz.options[wrong], exact: true })
      .click();
    await expect(page.getByRole("status")).toHaveText(/Not quite/);
    await page
      .getByRole("button", {
        name: lesson.quiz.options[lesson.quiz.answer],
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Awesome Job!" }),
    ).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Lesson progress" }),
    ).toHaveAttribute("aria-valuenow", "100");
    await expect(
      page.getByText(/You completed this practice lesson/),
    ).toBeVisible();
    await page.getByRole("button", { name: "Finish", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Choose Your Mission! 🚀" }),
    ).toBeVisible();
  }
  expect(dialogs).toBe(0);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("module back/skip returns to usable content, with mobile navigation and direct home", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modules");
  await page.getByRole("button", { name: /Earthquake Safety/ }).click();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: modules[0].steps[0].title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByRole("button", { name: "Take Quiz", exact: true }).click();
  await page.getByRole("button", { name: "Skip Quiz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Choose Your Mission! 🚀" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Earthquake Safety/ }).click();
  await expect(
    page.getByRole("heading", { name: modules[0].steps[0].title, exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("summary").click();
  await page.getByRole("link", { name: "Drills", exact: true }).click();
  await expect(page).toHaveURL("/drills");
  await page.getByRole("button", { name: "Back Home", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("standalone quiz counts each answer once, shows expected answers and resets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/quiz");
  await expect(
    page.getByRole("button", { name: "Next Question", exact: true }),
  ).toHaveCount(0);
  for (const [index, question] of quizData.entries()) {
    await expect(
      page.getByRole("heading", { name: question.question, exact: true }),
    ).toBeVisible();
    const option = page.getByRole("button", {
      name: question.answer,
      exact: true,
    });
    await option.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect(option).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText("Correct.");
    await page
      .getByRole("button", {
        name: index === quizData.length - 1 ? "View results" : "Next Question",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByText(`You scored ${quizData.length} out of ${quizData.length}`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retake", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: quizData[0].question, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: quizData[0].options.find(
        (option) => option !== quizData[0].answer,
      )!,
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    `Not quite. The expected answer is: ${quizData[0].answer}.`,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Back to games" }).click();
  await expect(page).toHaveURL("/games");
});

test("all drills preserve score/penalty rules and finish only after every expected step", async ({
  page,
}) => {
  await installAudio(page, "reject");
  await page.goto("/drills");
  for (const scenario of drills) {
    await page.getByRole("button", { name: new RegExp(scenario.name) }).click();
    await expect(
      page.getByRole("button", { name: "Finish practice" }),
    ).toBeDisabled();
    await expect(page.getByText(/Sound unavailable or blocked/)).toBeVisible();
    let score = 0;
    for (const step of scenario.steps) {
      const choice = page.getByRole("button", { name: new RegExp(step.text) });
      await choice.click();
      score = step.correct ? score + 100 : Math.max(0, score - 50);
      await expect(page.getByLabel("Drill score", { exact: true })).toHaveText(
        String(score),
      );
      if (step.correct) await expect(choice).toBeDisabled();
    }
    await page.getByRole("button", { name: "Finish practice" }).click();
    await expect(
      page.getByRole("heading", { name: "Practice complete!" }),
    ).toBeVisible();
    await expect(
      page.getByText("You selected the expected steps for this scenario."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to Mission Control" }).click();
  }
});

test("drill expiry blocks completion even after correct choices; retry and abort reset it", async ({
  page,
}) => {
  await page.clock.install();
  await installAudio(page);
  await page.goto("/drills");
  const scenario = drills[0];
  await page.getByRole("button", { name: new RegExp(scenario.name) }).click();
  for (const step of scenario.steps.filter((step) => step.correct))
    await page.getByRole("button", { name: new RegExp(step.text) }).click();
  await expect(
    page.getByRole("button", { name: "Finish practice" }),
  ).toBeEnabled();
  await page.clock.fastForward(61000);
  await expect(
    page.getByRole("alert").filter({ hasText: "Time is up." }),
  ).toHaveText("Time is up. This attempt cannot be completed.");
  await expect(page.getByRole("timer", { name: "Time remaining" })).toHaveText(
    "0s",
  );
  await expect(
    page.getByRole("button", { name: "Finish practice" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() =>
      window.__drillAudio.nodes.every((node) => node.paused),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByLabel("Drill score", { exact: true })).toHaveText("0");
  await expect(page.getByRole("timer", { name: "Time remaining" })).toHaveText(
    "60s",
  );
  await page.getByRole("button", { name: "All drills", exact: true }).click();
  await page.clock.fastForward(61000);
  await expect(
    page.getByRole("heading", { name: "Select Mission 🚨" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Time is up." }),
  ).toHaveCount(0);
});

test("mute and navigation stop every owned sound and the drill interval", async ({
  page,
}) => {
  await installAudio(page);
  await page.goto("/drills");
  await page.getByRole("button", { name: new RegExp(drills[0].name) }).click();
  await page.getByRole("button", { name: /Activate the Fire Alarm/ }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__drillAudio.nodes.filter((node) => !node.paused).length,
      ),
    )
    .toBe(2);
  await page.getByRole("button", { name: "Drill sound", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__drillAudio.nodes.every(
          (node) => node.paused && node.loads === 1,
        ),
      ),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Drill sound", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Drill sound", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__drillAudio.nodes.filter((node) => !node.paused).length,
      ),
    )
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.__drillTimers.size))
    .toBe(1);
  await page.getByRole("link", { name: "Modules", exact: true }).click();
  await expect(page).toHaveURL("/modules");
  expect(
    await page.evaluate(() =>
      window.__drillAudio.nodes.every((node) => node.paused),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => window.__drillTimers.size)).toBe(0);
});

test("stalled audio times out independently and mobile touch choices stay usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.clock.install();
  await installAudio(page, "stall");
  await page.goto("/drills");
  await page.getByRole("button", { name: new RegExp(drills[1].name) }).click();
  await page.clock.fastForward(8100);
  await expect(page.getByText(/Sound unavailable or blocked/)).toBeVisible();
  await page.getByRole("button", { name: /Drop, Cover, and Hold On/ }).tap();
  await expect(page.getByLabel("Drill score", { exact: true })).toHaveText(
    "100",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/disaster-drill-mobile.png",
    fullPage: true,
  });
});

test("unavailable WebGL cannot prevent a lesson from opening", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/modules");
  await page.getByRole("button", { name: /Fire Safety/ }).click();
  await expect(
    page.getByRole("heading", { name: modules[1].steps[0].title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: modules[1].steps[1].title, exact: true }),
  ).toBeVisible();
});

test("normal-motion lesson and drill scenes mount while controls remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await installAudio(page, "reject");
  await page.goto("/modules");
  await expect(page.locator("canvas")).toHaveCount(1);
  for (const lesson of modules) {
    await page.getByRole("button", { name: new RegExp(lesson.name) }).click();
    await expect(
      page.getByRole("heading", { name: lesson.steps[0].title, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Next Step", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: lesson.steps[1].title, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "All Modules", exact: true })
      .click();
  }
  await page.getByRole("link", { name: "Drills", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: new RegExp(drills[1].name) }).click();
  await page.getByRole("button", { name: /Drop, Cover, and Hold On/ }).click();
  await expect(page.getByLabel("Drill score", { exact: true })).toHaveText(
    "100",
  );
  await page.getByRole("button", { name: "All drills", exact: true }).click();
});
