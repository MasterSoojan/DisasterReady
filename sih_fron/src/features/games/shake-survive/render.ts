import {
  CONFIG,
  rand,
  clamp,
  now,
  type GameStatus,
  type Player,
  type CoverObject,
  type Debris,
  type Particle,
} from "./engine";
interface ShakeScene {
  player: Player;
  covers: CoverObject[];
  debris: Debris[];
  particles: Particle[];
  status: GameStatus;
  timing: { shakeStart: number; shakeDuration: number };
}

export function drawScene(canvas: HTMLCanvasElement, scene: ShakeScene) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const p = scene.player;

  if (scene.status === "shaking") {
    const rem = Math.max(
      0,
      scene.timing.shakeStart + scene.timing.shakeDuration - now(),
    );
    const amp = 8 * (rem / scene.timing.shakeDuration);
    ctx.save();
    ctx.translate(rand(-amp, amp), rand(-amp, amp));
  }

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill = true,
    stroke = false,
  ) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) {
      ctx.stroke();
    }
  };

  const drawBackground = () => {
    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(
      CONFIG.playAreaMargin,
      0,
      canvas.width - CONFIG.playAreaMargin * 2,
      150,
    );

    const floorGrad = ctx.createLinearGradient(0, 150, 0, canvas.height);
    floorGrad.addColorStop(0, "#334155");
    floorGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(
      CONFIG.playAreaMargin,
      150,
      canvas.width - CONFIG.playAreaMargin * 2,
      canvas.height - 150,
    );

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (
      let x = CONFIG.playAreaMargin;
      x < canvas.width - CONFIG.playAreaMargin;
      x += 40
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x - (x - canvas.width / 2) * 0.3, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, CONFIG.playAreaMargin, canvas.height);
    ctx.fillRect(
      canvas.width - CONFIG.playAreaMargin,
      0,
      CONFIG.playAreaMargin,
      canvas.height,
    );

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.font = "bold 30px Rajdhani";
    ctx.textAlign = "center";
    ctx.fillText("SAFETY ZONE", canvas.width / 2, 80);
    ctx.restore();
  };

  const drawDesk = (d: CoverObject) => {
    ctx.save();
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(d.x + 10, d.y + 10, 8, d.h - 10);
    ctx.fillRect(d.x + d.w - 18, d.y + 10, 8, d.h - 10);
    const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + 15);
    grad.addColorStop(0, d.isSafe ? "#d97706" : "#b91c1c");
    grad.addColorStop(1, "#92400e");
    ctx.fillStyle = grad;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    roundRect(d.x, d.y, d.w, 15, 4, true, false);

    if (scene.status === "choosing" && d.isSafe) {
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(d.x - 5, d.y - 5, d.w + 10, d.h + 10);
      ctx.setLineDash([]);
    }
    ctx.restore();
  };

  const drawBookshelf = (b: CoverObject) => {
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(b.toppleAngle);
    ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));

    ctx.fillStyle = "#3f3f46";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#27272a";
    ctx.fillRect(b.x + 5, b.y + 5, b.w - 10, b.h - 5);

    for (let i = 0; i < 4; i++) {
      const shelfY = b.y + (b.h / 4) * i + 10;
      ctx.fillStyle = "#52525b";
      ctx.fillRect(b.x + 5, shelfY + 30, b.w - 10, 5);
      for (let j = 0; j < 5; j++) {
        if (Math.random() > 0.3) {
          ctx.fillStyle = `hsl(${rand(190, 220)}, 40%, ${rand(40, 60)}%)`;
          ctx.fillRect(b.x + 10 + j * 14, shelfY + 5, 10, 25);
        }
      }
    }
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.restore();
  };

  const drawWindow = (w: CoverObject) => {
    ctx.save();
    ctx.translate(w.x + w.w / 2, w.y + 40);
    ctx.rotate(w.toppleAngle * 0.5);
    ctx.translate(-(w.x + w.w / 2), -(w.y + 40));

    ctx.fillStyle = "rgba(147, 197, 253, 0.3)";
    ctx.fillRect(w.x, w.y, w.w, 80);
    ctx.strokeStyle = w.isToppling ? "#f87171" : "#475569";
    ctx.lineWidth = 6;
    ctx.strokeRect(w.x, w.y, w.w, 80);
    ctx.beginPath();
    ctx.moveTo(w.x + w.w / 2, w.y);
    ctx.lineTo(w.x + w.w / 2, w.y + 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w.x, w.y + 40);
    ctx.lineTo(w.x + w.w, w.y + 40);
    ctx.stroke();
    ctx.restore();
  };

  const drawDebris = (d: Debris) => {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(now() * 0.005);
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(-d.size / 2, -d.size / 2);
    ctx.lineTo(d.size / 2, -d.size / 2);
    ctx.lineTo(0, d.size / 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPlayer = (pl: Player) => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(pl.x, pl.y + 5, pl.w * 0.8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const shirt = pl.isUnder ? "#38bdf8" : "#0ea5e9";
    ctx.fillStyle = shirt;
    roundRect(
      pl.x - pl.w / 2,
      pl.y - pl.h * 0.7,
      pl.w,
      pl.h * 0.7,
      6,
      true,
      false,
    );

    ctx.fillStyle = "#fca5a5";
    ctx.beginPath();
    ctx.arc(pl.x, pl.y - pl.h * 0.7, pl.w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (pl.isUnder && scene.status === "shaking") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y - pl.h * 0.5, 35, 0, Math.PI * 2);
      ctx.stroke();

      const safeColor = pl.isUnder.isSafe ? "#4ade80" : "#ef4444";
      ctx.strokeStyle = safeColor;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(
        pl.x,
        pl.y - pl.h * 0.5,
        35,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * pl.holdProgress,
      );
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawParticle = (pa: Particle) => {
    ctx.fillStyle = pa.color;
    ctx.globalAlpha = clamp(pa.lifespan / 0.5, 0, 1);
    ctx.fillRect(pa.x - pa.size / 2, pa.y - pa.size / 2, pa.size, pa.size);
    ctx.globalAlpha = 1.0;
  };

  drawBackground();
  const isUnderDesk = p.isUnder && p.isUnder.type === "desk";

  scene.covers.forEach((obj) => {
    if (obj.type === "window" || obj.type === "bookshelf") {
      if (obj.type === "bookshelf") drawBookshelf(obj);
      else drawWindow(obj);
    } else if (obj.type === "desk" && (!isUnderDesk || p.isUnder !== obj)) {
      drawDesk(obj);
    }
  });

  if (isUnderDesk && p.isUnder) {
    drawPlayer(p);
    drawDesk(p.isUnder);
  } else {
    scene.covers.forEach((obj) => {
      if (obj.type === "desk" && p.isUnder !== obj) drawDesk(obj);
    });
    drawPlayer(p);
  }

  scene.debris.forEach(drawDebris);
  scene.particles.forEach(drawParticle);

  if (scene.status === "shaking") ctx.restore();
}
