import { describe, expect, it } from "vitest";
import {
  createLevel,
  isBlocked,
  stepWorld,
  sprayAt,
  canvasPoint,
} from "../src/features/games/blaze-escape/engine";
import { TILE_SIZE } from "../src/features/games/blaze-escape/config";
import {
  createRun,
  takeChoice,
  type FireRun,
} from "../src/features/games/fire-escape/engine";
import { scenarios } from "../src/features/games/fire-escape/scenarios";
import { roomSpots } from "../src/features/games/spot-finder/engine";
import { rooms } from "../src/features/games/spot-finder/rooms";
import { decorationValue } from "../src/lib/decoration";
import { parseLeaderboard } from "../src/features/games/shake-survive/leaderboard";
import {
  createCoverObjects,
  CONFIG,
} from "../src/features/games/shake-survive/engine";

const noSpread = () => 0.99;
function choose(run: FireRun, text: string) {
  const choice = run.choices.find((choice) => choice.text === text);
  if (!choice) throw new Error(`Missing choice: ${text}`);
  return takeChoice(run, choice, noSpread);
}

describe("Blaze Escape simulation", () => {
  it("starts each level with independent objects and the preserved reset rules", () => {
    const world = createLevel(0),
      other = createLevel(0);
    world.player.health = 10;
    world.tiles[0][0] = false;
    expect(other.player.health).toBe(100);
    expect(other.tiles[0][0]).toBe(true);
    expect(createLevel(1).player.hasExtinguisher).toBe(false);
    expect(() => createLevel(3)).toThrow(RangeError);
  });
  it("blocks walls/bounds, preserves diagonal speed, and permits free movement", () => {
    const world = createLevel(0);
    expect(isBlocked(world, -1, 100)).toBe(true);
    expect(isBlocked(world, 0, 0)).toBe(true);
    const { x, y } = world.player;
    stepWorld(world, { ArrowRight: true, ArrowDown: true }, noSpread);
    expect(Math.hypot(world.player.x - x, world.player.y - y)).toBeCloseTo(2);
    world.player.x = TILE_SIZE + world.player.width / 2;
    stepWorld(world, { ArrowLeft: true }, noSpread);
    expect(world.player.x).toBe(TILE_SIZE + world.player.width / 2);
  });
  it("collects equipment, applies damage, and ends a depleted run", () => {
    const world = createLevel(0);
    world.player.x = (world.extinguisher!.x + 0.5) * TILE_SIZE;
    world.player.y = (world.extinguisher!.y + 0.5) * TILE_SIZE;
    expect(stepWorld(world, {}, noSpread).messages).toContain(
      "Fire Extinguisher Acquired! CLICK to use.",
    );
    expect(world.player.hasExtinguisher).toBe(true);
    const fire = world.fires[0];
    world.player.x = (fire.x + 0.5) * TILE_SIZE;
    world.player.y = (fire.y + 0.5) * TILE_SIZE;
    world.player.health = 0.1;
    expect(stepWorld(world, {}, noSpread).outcome).toBe("gameOver");
    expect(world.player.health).toBe(0);
  });
  it("consumes keys at adjacent doors and heals each medkit only once", () => {
    const world = createLevel(1),
      door = world.doors[0],
      medkit = world.medkits[0];
    world.player.hasKey = true;
    world.player.x = (door.x + 0.5) * TILE_SIZE;
    world.player.y = (door.y + 0.5) * TILE_SIZE;
    stepWorld(world, {}, noSpread);
    expect(door.unlocked).toBe(true);
    expect(world.tiles[door.y][door.x]).toBe(false);
    expect(world.player.hasKey).toBe(false);
    world.player.x = (medkit.x + 0.5) * TILE_SIZE;
    world.player.y = (medkit.y + 0.5) * TILE_SIZE;
    world.player.health = 75;
    stepWorld(world, {}, noSpread);
    expect(world.player.health).toBe(100);
    world.player.health = 60;
    stepWorld(world, {}, noSpread);
    expect(world.player.health).toBe(60);
  });
  it("advances intermediate exits and wins only at the final exit", () => {
    for (const index of [0, 1, 2]) {
      const world = createLevel(index);
      world.player.x = (world.exit!.x + 0.5) * TILE_SIZE;
      world.player.y = (world.exit!.y + 0.5) * TILE_SIZE;
      expect(stepWorld(world, {}, noSpread).outcome).toBe(
        index === 2 ? "win" : "nextLevel",
      );
    }
    const depleted = createLevel(0);
    depleted.player.x = (depleted.exit!.x + 0.5) * TILE_SIZE;
    depleted.player.y = (depleted.exit!.y + 0.5) * TILE_SIZE;
    depleted.player.health = 0;
    expect(stepWorld(depleted, {}, noSpread).outcome).toBe("gameOver");
  });
  it("requires an extinguisher, enforces reach, and scales pointer coordinates", () => {
    const world = createLevel(0);
    expect(sprayAt(world, world.player.x, world.player.y)).toBe(false);
    world.player.hasExtinguisher = true;
    const fire = world.fires[0];
    world.player.x = (fire.x + 0.5) * TILE_SIZE;
    world.player.y = (fire.y + 0.5) * TILE_SIZE;
    expect(sprayAt(world, 10000, 10000)).toBe(false);
    expect(sprayAt(world, world.player.x, world.player.y)).toBe(true);
    expect(world.fires).not.toContain(fire);
    expect(world.particles).toHaveLength(20);
    expect(
      canvasPoint(
        110,
        70,
        { left: 10, top: 20, width: 400, height: 300 },
        { width: 800, height: 600 },
      ),
    ).toEqual({ x: 200, y: 100 });
  });
});

describe("Fire Escape decisions", () => {
  it("reaches a win and resets stats and feedback together", () => {
    let run = createRun();
    for (const choice of [
      "Check door for heat",
      "Keep closed & seal",
      "Signal from window",
    ])
      run = choose(run, choice);
    expect(run.outcome).toBe("win");
    expect(choose(run, "Play Again")).toEqual(createRun());
  });
  it("applies consequences once and rejects stale choices", () => {
    const initial = createRun();
    const hallway = choose(initial, "Open door and peek");
    const crawled = choose(hallway, "Crawl low");
    expect(crawled.health).toBe(90);
    expect(crawled.visibility).toBe(60);
    expect(takeChoice(crawled, initial.choices[0])).toBe(crawled);
    expect(initial.health).toBe(100);
    expect(choose(hallway, "Run for stairs").outcome).toBe("loss");
  });
  it("keeps every authored transition resolvable", () => {
    for (const scene of Object.values(scenarios))
      for (const choice of scene.choices) {
        expect(choice.next === "reset" || Boolean(scenarios[choice.next])).toBe(
          true,
        );
      }
  });
});

it("Spot Finder shuffles order without changing coordinates or authored labels", () => {
  for (const room of rooms) {
    const ordered = roomSpots(room, () => 0.9),
      reversed = roomSpots(room, () => 0.1);
    expect(reversed).toEqual([...ordered].reverse());
    expect(ordered[0]).toEqual({ ...room.safeSpots[0], isSafe: true });
    expect(ordered[1]).toEqual({ ...room.unsafeSpots[0], isSafe: false });
  }
});

it("decorations remain deterministic, varied, and bounded", () => {
  const values = Array.from({ length: 50 }, (_, i) => decorationValue(i));
  expect(new Set(values).size).toBe(50);
  values.forEach((value, i) => {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    expect(decorationValue(i)).toBe(value);
  });
});

it("Shake Survive ignores malformed score records and caps the stored leaderboard", () => {
  expect(parseLeaderboard("broken")).toEqual([]);
  expect(parseLeaderboard('{"name":"not-a-list"}')).toEqual([]);
  expect(parseLeaderboard('[null,{"name":"x","score":"100"}]')).toEqual([]);
  const entries = Array.from({ length: 20 }, (_, i) => ({
    name: `Player ${i}`,
    score: i,
    level: 1,
    ts: i,
  }));
  expect(parseLeaderboard(JSON.stringify(entries))).toHaveLength(10);
});

it("Shake Survive generates bounded cover with safe desks", () => {
  for (const level of [1, 2, 3]) {
    const objects = createCoverObjects(level);
    expect(
      objects.some((object) => object.type === "desk" && object.isSafe),
    ).toBe(true);
    for (const object of objects) {
      expect(object.x).toBeGreaterThanOrEqual(CONFIG.playAreaMargin);
      expect(object.x + object.w).toBeLessThanOrEqual(
        CONFIG.canvasWidth - CONFIG.playAreaMargin,
      );
    }
  }
});
