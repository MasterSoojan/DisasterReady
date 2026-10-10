export type GameStatus = "ready" | "choosing" | "shaking" | "score";

export function createCoverObjects(currentLevel: number): CoverObject[] {
  const objects: CoverObject[] = [];
  const objectTypes = [
    { type: "desk", w: 110, h: 54, count: 2 + Math.floor(currentLevel / 3) },
    {
      type: "bookshelf",
      w: 80,
      h: 180,
      count: 1 + Math.floor(currentLevel / 2),
    },
    { type: "window", w: 120, h: 10, count: 1 },
  ];
  const margins = CONFIG.playAreaMargin;

  const getBoundingBox = (obj: {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }) => {
    if (obj.type === "window") return { x: obj.x, y: obj.y, w: obj.w, h: 80 };
    return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
  };

  for (const objType of objectTypes) {
    for (let i = 0; i < objType.count; i++) {
      let newObj,
        overlaps,
        attempts = 0;
      do {
        const x = rand(margins, CONFIG.canvasWidth - margins - objType.w);
        let y;
        if (objType.type === "window") y = 100;
        else if (objType.type === "bookshelf")
          y = rand(CONFIG.canvasHeight - 480, CONFIG.canvasHeight - 380);
        else y = rand(CONFIG.canvasHeight - 400, CONFIG.canvasHeight - 150);

        newObj = new CoverObject(x, y, objType.w, objType.h, objType.type);
        const newObjRect = getBoundingBox(newObj);

        overlaps = objects.some((existingObj) => {
          const existingObjRect = getBoundingBox(existingObj);
          const padding = 20;
          return intersectRect(
            {
              x: newObjRect.x - padding,
              y: newObjRect.y - padding,
              w: newObjRect.w + padding * 2,
              h: newObjRect.h + padding * 2,
            },
            existingObjRect,
          );
        });
        attempts++;
      } while (overlaps && attempts < 50);

      if (!overlaps) objects.push(newObj);
    }
  }
  return objects;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  ts: number;
}

export const CONFIG = {
  canvasWidth: 1200,
  canvasHeight: 720,
  playAreaMargin: 250,
  debrisPerSecond: 4.5,
  shakeDurationBase: 5000,
  choiceDuration: 8.0, // UPDATED: 8 seconds to find cover
  playerSpeed: 220,
  gravity: 800,
  maxHealth: 65,
  holdOnDuration: 2000,
};

// ---------- HELPERS ----------
export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}
export function now(): number {
  return performance.now();
}

// ---------- GAME CLASSES ----------
export class Player {
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  isUnder: CoverObject | null;
  holdProgress: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 48;
    this.health = CONFIG.maxHealth;
    this.isUnder = null;
    this.holdProgress = 0;
  }
  rect() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }
}

export class CoverObject {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  isSafe: boolean;
  safeRadius: number;
  isToppling: boolean;
  hasToppled: boolean;
  toppleAngle: number;
  toppleDirection: number;
  constructor(x: number, y: number, w: number, h: number, type: string) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.isSafe = type === "desk";
    this.safeRadius = Math.max(w, h) * 0.7;
    this.isToppling = false;
    this.hasToppled = false;
    this.toppleAngle = 0;
    this.toppleDirection = Math.random() > 0.5 ? 1 : -1;
  }
}

export class Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alive: boolean;
  constructor(x: number, y: number, vx: number, vy: number, size: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.alive = true;
  }
  update(dt: number) {
    this.vy += CONFIG.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y > CONFIG.canvasHeight + 200) this.alive = false;
  }
  rect() {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      w: this.size,
      h: this.size,
    };
  }
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  lifespan: number;
  color: string;
  gravity: number;
  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = rand(-150, 150);
    this.vy = rand(-200, 50);
    this.size = rand(2, 5);
    this.lifespan = rand(0.3, 0.8);
    this.color = color;
    this.gravity = CONFIG.gravity * 0.8;
  }
  update(dt: number) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespan -= dt;
  }
}

export const intersectRect = (
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number },
) => {
  return !(
    r2.x > r1.x + r1.w ||
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y
  );
};
