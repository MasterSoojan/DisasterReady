import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { homeFeatures } from "../src/features/home/content";
import { games } from "../src/features/games/menu/data";
import { helpTopics, emergencyResource } from "../src/features/help/content";

it("homepage features point to distinct implemented routes and carry their own descriptions/icons", () => {
  expect(new Set(homeFeatures.map((feature) => feature.href)).size).toBe(
    homeFeatures.length,
  );
  for (const feature of homeFeatures) {
    expect(
      existsSync(resolve("src/app", feature.href.slice(1), "page.tsx")),
    ).toBe(true);
    expect(feature.title).not.toBe("");
    expect(feature.description).not.toBe("");
    expect(typeof feature.Icon).toBe("function");
  }
});
it("the arcade keeps all five original game destinations with unique identities", () => {
  expect(games.map((game) => game.href)).toEqual([
    "/games/quiz",
    "/games/SpotFinder",
    "/games/FireEscape",
    "/games/ShakeSurvive",
    "/games/BlazeEscape",
  ]);
  expect(new Set(games.map((game) => game.id)).size).toBe(5);
  for (const game of games)
    expect(existsSync(resolve("src/app", game.href.slice(1), "page.tsx"))).toBe(
      true,
    );
});
it("help routes exist and emergency information has explicit regional/source metadata", () => {
  for (const topic of helpTopics) {
    if (topic.href.startsWith("#")) continue;
    expect(
      existsSync(resolve("src/app", topic.href.slice(1), "page.tsx")),
    ).toBe(true);
  }
  expect(emergencyResource.region).toBe("India");
  expect(emergencyResource.phone).toBe("112");
  expect(new URL(emergencyResource.source).hostname).toBe("www.mha.gov.in");
  expect(emergencyResource.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(existsSync(resolve("public/logo.jpg"))).toBe(true);
  expect(existsSync(resolve("public/robot-girl.png"))).toBe(true);
});
