import { describe, expect, it, vi, afterEach } from "vitest";
import {
  CONFIG,
  Player,
  CoverObject,
  Debris,
  clamp,
  intersectRect,
} from "../src/features/games/shake-survive/engine";
import { levelDesigns } from "../src/features/games/blaze-escape/config";
import { quizData } from "../src/features/games/quiz/questions";
import { rooms } from "../src/features/games/spot-finder/rooms";
import { parseDemoUsers } from "../src/features/accounts/demoUsers";
import { sendChat } from "../src/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("preserved learning-game rules", () => {
  it("keeps health, cover classification, bounds, and collision rules", () => {
    expect(new Player(50, 50).health).toBe(CONFIG.maxHealth);
    expect(new CoverObject(0, 0, 10, 10, "desk").isSafe).toBe(true);
    expect(new CoverObject(0, 0, 10, 10, "window").isSafe).toBe(false);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(
      intersectRect({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 10, w: 2, h: 2 }),
    ).toBe(true);
    expect(
      intersectRect({ x: 0, y: 0, w: 10, h: 10 }, { x: 11, y: 11, w: 2, h: 2 }),
    ).toBe(false);
  });
  it("updates debris physics and retires off-canvas debris", () => {
    const debris = new Debris(0, 0, 10, 0, 5);
    debris.update(0.5);
    expect(debris.x).toBe(5);
    expect(debris.vy).toBe(CONFIG.gravity * 0.5);
    debris.update(10);
    expect(debris.alive).toBe(false);
  });
  it("keeps playable maps and matching questions/answers", () => {
    expect(levelDesigns).toHaveLength(3);
    for (const level of levelDesigns) {
      expect(level.every((row) => row.length === level[0].length)).toBe(true);
      expect(level.join("").split("P")).toHaveLength(2);
      expect(level.join("")).toContain("X");
    }
    for (const question of quizData)
      expect(question.options).toContain(question.answer);
    for (const room of rooms) {
      expect(room.safeSpots.length).toBeGreaterThan(0);
      expect(room.unsafeSpots.length).toBeGreaterThan(0);
    }
  });
});
it("recovers from malformed demo-account storage", () => {
  expect(parseDemoUsers("{broken")).toEqual([]);
  expect(parseDemoUsers('{"username":"x"}')).toEqual([]);
  expect(
    parseDemoUsers('[null,{"username":"a","role":"student"},{"role":"admin"}]'),
  ).toEqual([{ username: "a", role: "student" }]);
});
it("validates chat responses and exposes service failures", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000/");
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ user_message: "hi", bot_response: "hello" }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  expect((await sendChat("hi")).bot_response).toBe("hello");
  expect(fetcher.mock.calls[0][0]).toBe("http://localhost:8000/chat");
  fetcher.mockResolvedValueOnce(new Response('{"bot_response":3}'));
  await expect(sendChat("hi")).rejects.toThrow("invalid response");
  fetcher.mockResolvedValueOnce(new Response("", { status: 503 }));
  await expect(sendChat("hi")).rejects.toThrow("unavailable");
});
