import { TILE_SIZE, type GameObject } from "./config";
import type { BlazeWorld } from "./engine";

export function drawWorld(canvas: HTMLCanvasElement, world: BlazeWorld) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Level
  const level = world.tiles;
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x]) {
        ctx.fillStyle = "#4a5568";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw Items
  const drawEmoji = (emoji: string, item: GameObject, color: string) => {
    ctx.fillStyle = color;
    ctx.font = `${TILE_SIZE * 0.8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      emoji,
      item.x * TILE_SIZE + TILE_SIZE / 2,
      item.y * TILE_SIZE + TILE_SIZE / 2,
    );
  };

  if (world.extinguisher && !world.extinguisher.collected)
    drawEmoji("🧯", world.extinguisher, "white");
  world.keys.forEach((key) => !key.collected && drawEmoji("🔑", key, "yellow"));
  world.doors.forEach((door) => !door.unlocked && drawEmoji("🔒", door, "red"));
  world.medkits.forEach(
    (medkit) => !medkit.collected && drawEmoji("✚", medkit, "lightgreen"),
  );
  if (world.exit) drawEmoji("🚪", world.exit, "hsl(120, 50%, 70%)");

  // Draw Fires
  world.fires.forEach((fire) => {
    const flicker = Math.random() * 0.2 + 0.9;
    const size = fire.size * flicker;
    const grad = ctx.createRadialGradient(
      fire.x * TILE_SIZE + fire.size / 2,
      fire.y * TILE_SIZE + fire.size / 2,
      size * 0.1,
      fire.x * TILE_SIZE + fire.size / 2,
      fire.y * TILE_SIZE + fire.size / 2,
      size * 0.5,
    );
    grad.addColorStop(0, "rgba(255, 255, 100, 0.9)");
    grad.addColorStop(0.6, "rgba(255, 100, 0, 0.7)");
    grad.addColorStop(1, "rgba(200, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(
      fire.x * TILE_SIZE + fire.size / 2,
      fire.y * TILE_SIZE + fire.size / 2,
      size * 0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  // Draw Player
  if (world.player) {
    const p = world.player;
    ctx.fillStyle = "cyan";
    ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
  }

  // Draw Particles
  world.particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}
