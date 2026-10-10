// --- TypeScript Interfaces ---
export type GameState = "start" | "playing" | "gameOver" | "win";

export interface GameObject {
  x: number;
  y: number;
}

export interface Player extends GameObject {
  health: number;
  smokeLevel: number;
  hasExtinguisher: boolean;
  hasKey: boolean;
  width: number;
  height: number;
}

export interface Fire extends GameObject {
  size: number;
}

export interface Item extends GameObject {
  collected: boolean;
}

export interface LockedDoor extends GameObject {
  unlocked: boolean;
}

export interface Particle extends GameObject {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// --- Game Constants ---
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 2;
export const FIRE_SPREAD_RATE = 0.005;
export const SMOKE_INCREASE_RATE = 0.01;
export const DAMAGE_RATE_FIRE = 0.5;
export const DAMAGE_RATE_SMOKE = 0.1;
export const MEDKIT_HEAL_AMOUNT = 50;

export const levelDesigns = [
  // Level 1: Introduction
  [
    "WWWWWWWWWWWWWWWWWWWW",
    "W P      W         W",
    "W        W  F      W",
    "W WWWWW  W  F      W",
    "W W   W  W         W",
    "W   E W  WWWWWWWW  W",
    "W W   W            W",
    "W WWWWWWWWWWWW     W",
    "W    F             W",
    "W    F         F   W",
    "W WWWWWWWWWWWWWWWW W",
    "W                  W",
    "W      F           W",
    "W         X        W",
    "WWWWWWWWWWWWWWWWWWWW",
  ],
  // Level 2: Key and Door
  [
    "WWWWWWWWWWWWWWWWWWWW",
    "W P      F       F W",
    "W WWWWWWWWWWWWWWWW W",
    "W F   K        F   W",
    "W W WWWWWWWWWWWW W W",
    "W W F      W L W W W",
    "W WWWWWWWW W W W W W",
    "W E F      W W W X W",
    "W WWWWWWWW W WWWWWWW",
    "W          W       W",
    "W F WWWWWWWWWWWWWW W",
    "W W H            F W",
    "W WWWWWWWWWWWWWWWW W",
    "W F                W",
    "WWWWWWWWWWWWWWWWWWWW",
  ],
  // Level 3: Redesigned
  [
    "WWWWWWWWWWWWWWWWWWWW",
    "W      L X         W",
    "W WWWWWWWWWWWWWWWW W",
    "W W K        F   W W",
    "W W WWWWWWWWWWWW W W",
    "W W            W W W",
    "W WWWWWWWWWW F W W W",
    "W   H    W   F W   W",
    "W WWWWWW W WWWWWWW W",
    "W      W W         W",
    "W F FF W W WWWWWWWWW",
    "W      W   E       W",
    "W WWWWWWWWWWWWWWWW W",
    "W P                W",
    "WWWWWWWWWWWWWWWWWWWW",
  ],
];
