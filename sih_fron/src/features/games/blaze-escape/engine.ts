import {
  TILE_SIZE,
  PLAYER_SPEED,
  FIRE_SPREAD_RATE,
  SMOKE_INCREASE_RATE,
  DAMAGE_RATE_FIRE,
  DAMAGE_RATE_SMOKE,
  MEDKIT_HEAL_AMOUNT,
  levelDesigns,
  type Player,
  type Fire,
  type Item,
  type LockedDoor,
  type GameObject,
  type Particle,
} from "./config";

export interface BlazeWorld {
  levelIndex: number;
  tiles: boolean[][];
  player: Player;
  fires: Fire[];
  keys: Item[];
  doors: LockedDoor[];
  medkits: Item[];
  extinguisher: Item | null;
  exit: GameObject | null;
  particles: Particle[];
}

export function createLevel(levelIndex: number): BlazeWorld {
  const map = levelDesigns[levelIndex];
  if (!map) throw new RangeError("Unknown Blaze Escape level");
  const world: BlazeWorld = {
    levelIndex,
    tiles: [],
    fires: [],
    keys: [],
    doors: [],
    medkits: [],
    extinguisher: null,
    exit: null,
    particles: [],
    player: {
      x: 0,
      y: 0,
      health: 100,
      smokeLevel: 0,
      hasExtinguisher: false,
      hasKey: false,
      width: TILE_SIZE * 0.6,
      height: TILE_SIZE * 0.6,
    },
  };
  map.forEach((row, y) => {
    world.tiles[y] = [];
    [...row].forEach((tile, x) => {
      world.tiles[y][x] = tile === "W" || tile === "L";
      switch (tile) {
        case "P":
          world.player.x = (x + 0.5) * TILE_SIZE;
          world.player.y = (y + 0.5) * TILE_SIZE;
          break;
        case "F":
          world.fires.push({ x, y, size: TILE_SIZE });
          break;
        case "K":
          world.keys.push({ x, y, collected: false });
          break;
        case "L":
          world.doors.push({ x, y, unlocked: false });
          break;
        case "H":
          world.medkits.push({ x, y, collected: false });
          break;
        case "E":
          world.extinguisher = { x, y, collected: false };
          break;
        case "X":
          world.exit = { x, y };
          break;
      }
    });
  });
  return world;
}

export function isBlocked(
  world: BlazeWorld,
  x: number,
  y: number,
  ignoreDoors = false,
) {
  const tileX = Math.floor(x / TILE_SIZE),
    tileY = Math.floor(y / TILE_SIZE);
  const tile = world.tiles[tileY]?.[tileX];
  if (tile === undefined) return true;
  return ignoreDoors
    ? levelDesigns[world.levelIndex][tileY][tileX] === "W"
    : tile;
}

export interface FrameEvents {
  messages: string[];
  sounds: { name: "pickup" | "door_unlock"; note: string; duration: string }[];
  hurt: boolean;
  outcome: "nextLevel" | "win" | "gameOver" | null;
}

/** One original 60 Hz simulation step; mutable world is never React state. */
export function stepWorld(
  world: BlazeWorld,
  keys: Record<string, boolean>,
  random = Math.random,
): FrameEvents {
  const events: FrameEvents = {
    messages: [],
    sounds: [],
    hurt: false,
    outcome: null,
  };
  const p = world.player;
  let dx = 0,
    dy = 0;
  if (keys.ArrowUp || keys.w) dy -= PLAYER_SPEED;
  if (keys.ArrowDown || keys.s) dy += PLAYER_SPEED;
  if (keys.ArrowLeft || keys.a) dx -= PLAYER_SPEED;
  if (keys.ArrowRight || keys.d) dx += PLAYER_SPEED;
  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  const newX = p.x + dx,
    newY = p.y + dy;
  if (
    !isBlocked(
      world,
      newX + (dx > 0 ? p.width / 2 : -p.width / 2),
      p.y - p.height / 2,
    ) &&
    !isBlocked(
      world,
      newX + (dx > 0 ? p.width / 2 : -p.width / 2),
      p.y + p.height / 2,
    )
  )
    p.x = newX;
  if (
    !isBlocked(
      world,
      p.x - p.width / 2,
      newY + (dy > 0 ? p.height / 2 : -p.height / 2),
    ) &&
    !isBlocked(
      world,
      p.x + p.width / 2,
      newY + (dy > 0 ? p.height / 2 : -p.height / 2),
    )
  )
    p.y = newY;

  world.fires.forEach((fire) => {
    if (random() >= FIRE_SPREAD_RATE) return;
    const neighbors = [
      { x: fire.x + 1, y: fire.y },
      { x: fire.x - 1, y: fire.y },
      { x: fire.x, y: fire.y + 1 },
      { x: fire.x, y: fire.y - 1 },
    ].filter(
      (n) =>
        !isBlocked(world, n.x * TILE_SIZE, n.y * TILE_SIZE, true) &&
        !world.fires.some((f) => f.x === n.x && f.y === n.y),
    );
    if (neighbors.length)
      world.fires.push({
        ...neighbors[Math.floor(random() * neighbors.length)],
        size: TILE_SIZE,
      });
  });
  p.smokeLevel = Math.min(
    100,
    p.smokeLevel + world.fires.length * SMOKE_INCREASE_RATE,
  );
  const tileX = Math.floor(p.x / TILE_SIZE),
    tileY = Math.floor(p.y / TILE_SIZE);
  const standingOn = (item: GameObject) => item.x === tileX && item.y === tileY;
  if (world.fires.some(standingOn)) {
    p.health -= DAMAGE_RATE_FIRE;
    events.hurt = true;
  }
  if (p.smokeLevel > 50) p.health -= (p.smokeLevel / 100) * DAMAGE_RATE_SMOKE;
  if (
    world.extinguisher &&
    !world.extinguisher.collected &&
    standingOn(world.extinguisher)
  ) {
    world.extinguisher.collected = true;
    p.hasExtinguisher = true;
    events.messages.push("Fire Extinguisher Acquired! CLICK to use.");
    events.sounds.push({ name: "pickup", note: "C5", duration: "0.2" });
  }
  for (const key of world.keys) {
    if (!key.collected && standingOn(key)) {
      key.collected = true;
      p.hasKey = true;
      events.messages.push("Key Acquired!");
      events.sounds.push({ name: "pickup", note: "G5", duration: "0.2" });
    }
  }
  for (const medkit of world.medkits) {
    if (!medkit.collected && standingOn(medkit)) {
      medkit.collected = true;
      p.health = Math.min(100, p.health + MEDKIT_HEAL_AMOUNT);
      events.messages.push("Health Recovered!");
      events.sounds.push({ name: "pickup", note: "A5", duration: "0.3" });
    }
  }
  if (p.hasKey) {
    const door = world.doors.find(
      (d) =>
        !d.unlocked &&
        Math.hypot(
          p.x - (d.x + 0.5) * TILE_SIZE,
          p.y - (d.y + 0.5) * TILE_SIZE,
        ) < TILE_SIZE,
    );
    if (door) {
      door.unlocked = true;
      world.tiles[door.y][door.x] = false;
      p.hasKey = false;
      events.sounds.push({ name: "door_unlock", note: "C4", duration: "0.1" });
    }
  }
  if (world.exit && standingOn(world.exit))
    events.outcome =
      world.levelIndex < levelDesigns.length - 1 ? "nextLevel" : "win";
  // Preserve the original final-exit precedence, but a depleted intermediate
  // run must end instead of resetting its health on the next level.
  if (p.health <= 0 && events.outcome !== "win") {
    p.health = 0;
    events.outcome = "gameOver";
  }
  world.particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
  });
  world.particles = world.particles.filter((particle) => particle.life > 0);
  return events;
}

export function sprayAt(
  world: BlazeWorld,
  x: number,
  y: number,
  random = Math.random,
): boolean {
  const p = world.player;
  const tileX = Math.floor(x / TILE_SIZE),
    tileY = Math.floor(y / TILE_SIZE);
  const dx = tileX - Math.floor(p.x / TILE_SIZE),
    dy = tileY - Math.floor(p.y / TILE_SIZE);
  if (!p.hasExtinguisher || Math.abs(dx) > 2 || Math.abs(dy) > 2) return false;
  world.fires = world.fires.filter((f) => f.x !== tileX || f.y !== tileY);
  for (let i = 0; i < 20; i++)
    world.particles.push({
      x: p.x,
      y: p.y,
      vx: (random() - 0.5 + dx * 0.5) * 4,
      vy: (random() - 0.5 + dy * 0.5) * 4,
      life: 30,
      color: `rgba(200, 220, 255, ${random() * 0.5 + 0.5})`,
    });
  return true;
}

export function canvasPoint(
  clientX: number,
  clientY: number,
  bounds: { left: number; top: number; width: number; height: number },
  canvas: { width: number; height: number },
) {
  return {
    x: ((clientX - bounds.left) * canvas.width) / bounds.width,
    y: ((clientY - bounds.top) * canvas.height) / bounds.height,
  };
}
