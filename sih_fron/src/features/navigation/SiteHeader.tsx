"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const pages = [
  "leaderboard",
  "modules",
  "drills",
  "account",
  "games",
  "chat",
  "help",
];

/** One primary navigation and mobile menu across the public learning/demo pages. */
export function SiteHeader({
  darkMode,
  toggleTheme,
  current,
  children,
}: {
  darkMode: boolean;
  toggleTheme: () => void;
  current:
    | "home"
    | "modules"
    | "drills"
    | "account"
    | "leaderboard"
    | "games"
    | "chat"
    | "help";
  children?: ReactNode;
}) {
  const links = pages.map((page) => (
    <Link
      key={page}
      href={`/${page}`}
      aria-current={page === current ? "page" : undefined}
      className="rounded-full px-3 py-2 font-semibold text-white hover:bg-white/20 focus-visible:outline-2"
    >
      {page.charAt(0).toUpperCase() + page.slice(1)}
    </Link>
  ));
  return (
    <nav
      aria-label="Primary navigation"
      className={`relative z-50 mx-4 mt-2 rounded-3xl shadow-xl pointer-events-auto ${darkMode ? "bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800" : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4">
        <Link
          href="/"
          aria-current={current === "home" ? "page" : undefined}
          className="flex items-center gap-2"
        >
          <Image
            width={64}
            height={64}
            unoptimized
            src="/logo.jpg"
            alt=""
            className="h-10 w-10 rounded-full mix-blend-multiply md:h-16 md:w-16"
          />
          <span
            className={`text-lg font-extrabold md:text-3xl ${darkMode ? "text-yellow-300" : "text-white"}`}
          >
            DisasterReady
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex">{links}</div>
          {children}
          <button
            type="button"
            aria-label="Toggle color theme"
            aria-pressed={darkMode}
            onClick={toggleTheme}
            className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
        <details className="w-full text-white lg:hidden">
          <summary className="cursor-pointer rounded-xl px-2 py-1 font-semibold">
            Menu
          </summary>
          <div className="flex flex-wrap gap-1 py-2">{links}</div>
        </details>
      </div>
    </nav>
  );
}
