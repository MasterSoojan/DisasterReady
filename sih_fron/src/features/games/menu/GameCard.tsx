"use client";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useReducedLearningMotion } from "@/features/learning/DecorativeCanvas";
import type { games } from "./data";

export function GameCard({
  game,
  darkMode,
}: {
  game: (typeof games)[number];
  darkMode: boolean;
}) {
  const reducedMotion = useReducedLearningMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const Icon = game.Icon;
  return (
    <Link
      href={game.href}
      aria-label={"Play " + game.title}
      className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <motion.div
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={(event) => {
          if (reducedMotion) return;
          const rect = event.currentTarget.getBoundingClientRect();
          x.set(((event.clientX - rect.left) / rect.width - 0.5) * 200);
          y.set(((event.clientY - rect.top) / rect.height - 0.5) * 200);
        }}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        whileHover={reducedMotion ? undefined : { scale: 1.03 }}
        className={
          "relative min-h-72 overflow-hidden rounded-3xl border border-slate-400/20 p-6 text-center shadow-xl " +
          (darkMode ? "bg-gray-800 text-white" : "bg-white text-slate-900")
        }
      >
        <div
          aria-hidden="true"
          className={
            "absolute inset-0 bg-gradient-to-br opacity-10 " + game.color
          }
        />
        <div className="relative z-10 flex h-full flex-col items-center">
          <div
            className={
              "mb-4 rounded-full bg-gradient-to-br p-4 text-white " + game.color
            }
          >
            <Icon aria-hidden="true" className="text-4xl" />
          </div>
          <h2 className="mb-2 text-2xl font-black">{game.title}</h2>
          <p>{game.description}</p>
          <p className="mt-4 rounded-full border px-3 py-1 text-xs font-semibold">
            Game difficulty: {game.difficulty}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
