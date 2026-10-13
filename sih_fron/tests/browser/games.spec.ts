import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { rooms } from "../../src/features/games/spot-finder/rooms";

test("Fire Escape supports a win, restart, loss and second restart", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/games/FireEscape");
  for (const text of [
    "Check door for heat",
    "Keep closed & seal",
    "Signal from window",
  ]) {
    await page.getByRole("button", { name: text, exact: false }).click();
  }
  await expect(
    page.getByRole("heading", { name: /YOU SURVIVED/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Play Again/ }).click();
  await page.getByRole("button", { name: /Check door for heat/ }).click();
  await page.getByRole("button", { name: /Open it anyway/ }).click();
  await expect(page.getByRole("heading", { name: /GAME OVER/ })).toBeVisible();
  await page.getByRole("button", { name: /Restart/ }).click();
  await expect(
    page.getByRole("button", { name: /Stay and call help/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("Spot Finder accepts keyboard choices once, progresses every room, and resets", async ({
  page,
}) => {
  await page.goto("/games/SpotFinder");
  for (const [index, room] of rooms.entries()) {
    const spot = page.getByRole("button", {
      name: room.safeSpots[0].label,
      exact: true,
    });
    await spot.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
      String((index + 1) * 100),
    );
    await page
      .getByRole("button", {
        name: index === rooms.length - 1 ? "FINISH MISSION" : /NEXT LEVEL/,
      })
      .click();
  }
  await expect(page.getByText("MISSION REPORT", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "REPLAY SIMULATION" }).click();
  await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
    "0",
  );
  await page
    .getByRole("button", { name: rooms[0].unsafeSpots[0].label, exact: true })
    .click();
  await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
    "-20",
  );
});

async function playerPosition(page: Page) {
  return page
    .getByLabel("Blaze Escape playfield")
    .evaluate((element: HTMLCanvasElement) => {
      const pixels = element
        .getContext("2d")!
        .getImageData(0, 0, element.width, element.height).data;
      let x = 0,
        y = 0,
        count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 0 && pixels[i + 1] === 255 && pixels[i + 2] === 255) {
          const pixel = i / 4;
          x += pixel % element.width;
          y += Math.floor(pixel / element.width);
          count++;
        }
      }
      return { x: x / count, y: y / count, count };
    });
}

test("Blaze starts without the audio CDN and keyboard movement stops at walls", async ({
  page,
}) => {
  await page.goto("/games/BlazeEscape");
  await expect(page.getByRole("status")).toHaveText(/Audio unavailable/);
  await page.clock.install();
  await page.evaluate(() => {
    Math.random = () => 0.99;
  });
  await page.getByRole("button", { name: "START", exact: true }).click();
  await page.clock.runFor(50);
  const initial = await playerPosition(page);
  expect(initial.count).toBeGreaterThan(0);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(1000);
  await page.keyboard.up("ArrowRight");
  const moved = await playerPosition(page);
  expect(moved.x).toBeGreaterThan(initial.x + 100);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(2000);
  await page.keyboard.up("ArrowRight");
  expect((await playerPosition(page)).x).toBeLessThan(360);
  await expect(page.getByText("LEVEL 1", { exact: true })).toBeVisible();
});

test("Shake Survive recovers bad scores, times the choice phase, and saves locally", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("shake_survive_leaderboard", "{broken"),
  );
  await page.goto("/games/ShakeSurvive");
  await expect(page.getByText("No records found")).toBeVisible();
  const name = page.getByPlaceholder("Enter Name");
  await name.fill("Test Survivor");
  await name.press("Space");
  await expect(
    page.getByRole("button", { name: /Initiate Drill/ }),
  ).toBeVisible();
  await page.clock.install();
  await page.getByRole("button", { name: /Initiate Drill/ }).click();
  await page.clock.runFor(100);
  await expect(page.getByText("Find Cover!", { exact: true })).toBeVisible();
  await page.clock.runFor(8000);
  await expect(
    page.getByText("Earthquake! Hold On!", { exact: true }),
  ).toBeVisible();
  await page.clock.runFor(7000);
  await expect(
    page.getByRole("heading", { name: /SURVIVED|GAME OVER/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Score saved on this device.",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("shake_survive_leaderboard")!)[0].name,
    ),
  ).toBe("Test Survivor");
  await page
    .getByRole("button", { name: /Next Level|Retry Simulation/ })
    .click();
  await page.clock.runFor(100);
  await expect(page.getByText("Find Cover!", { exact: true })).toBeVisible();
});

test("missing or malformed prototype accounts redirect without rendering protected pages", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("currentUser", "{broken"),
  );
  await page.goto("/account/dashboard");
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: "Demo accounts" }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ username: "Student", role: "student" }),
    ),
  );
  await page.goto("/leaderboard");
  await expect(page).toHaveURL(/\/account$/);
});

test("leaving Blaze cancels canvas updates and disposes all audio nodes", async ({
  page,
}) => {
  await page.route("**/Tone.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `
    window.testAudio = { created: 0, disposed: 0, started: 0 };
    class Sound {
      constructor() { window.testAudio.created++; }
      toDestination() { return this; }
      triggerAttackRelease() {}
      triggerAttack() {}
      triggerRelease() {}
      dispose() { window.testAudio.disposed++; }
    }
    window.Tone = { NoiseSynth: Sound, Synth: Sound,
      start: async () => { window.testAudio.started++; } };
  `,
    }),
  );
  await page.goto("/games/BlazeEscape");
  await expect(page.getByRole("status")).toHaveText("Audio available");
  await page.clock.install();
  await page
    .getByLabel("Blaze Escape playfield")
    .evaluate((canvas: HTMLCanvasElement) => {
      const state = window as unknown as { gameDraws: number };
      state.gameDraws = 0;
      const context = canvas.getContext("2d")!;
      const clear = context.clearRect.bind(context);
      context.clearRect = (...args) => {
        state.gameDraws++;
        clear(...args);
      };
    });
  await page.getByRole("button", { name: "START", exact: true }).click();
  await page.clock.runFor(100);
  await page.getByRole("link", { name: /All games/ }).click();
  await expect(page).toHaveURL(/\/games$/);
  const snapshot = () =>
    page.evaluate(() => {
      const state = window as unknown as {
        gameDraws: number;
        testAudio: { created: number; disposed: number; started: number };
      };
      return { draws: state.gameDraws, ...state.testAudio };
    });
  const stopped = await snapshot();
  expect(stopped.created).toBe(6);
  expect(stopped.started).toBe(1);
  expect(stopped.disposed).toBe(6);
  await page.clock.runFor(300);
  expect((await snapshot()).draws).toBe(stopped.draws);
});

test("saved theme survives hydration, navigation and reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("darkMode") === null)
      localStorage.setItem("darkMode", "true");
  });
  await page.goto("/help");
  const toggle = page.getByRole("button", { name: "Toggle color theme" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("darkMode"))).toBe(
    "true",
  );
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("link", { name: "Games", exact: true }).click();
  await expect(page).toHaveURL(/\/games$/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("theme remains usable when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage disabled for test");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage disabled for test");
    };
  });
  await page.goto("/help");
  const toggle = page.getByRole("button", { name: "Toggle color theme" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});
