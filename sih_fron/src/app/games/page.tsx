"use client";
import Link from "next/link";
import { Float, Stars, Sparkles } from "@react-three/drei";
import { FaGamepad } from "react-icons/fa";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { GameController, FloatingPowerups } from "@/features/games/menu/Scene";
import { GameCard } from "@/features/games/menu/GameCard";
import { games } from "@/features/games/menu/data";

export default function GamesMenuPage() {
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <main
      className={
        "relative min-h-screen overflow-hidden pb-16 " +
        (darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-slate-900")
      }
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <DecorativeCanvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={1}
          />
          <Stars radius={100} depth={50} count={3000} factor={4} fade />
          <Sparkles
            count={100}
            scale={15}
            size={5}
            speed={0.4}
            opacity={0.5}
            color={darkMode ? "cyan" : "purple"}
          />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <GameController
              position={[0, 2.5, 0]}
              rotation={[0.5, 0.5, 0]}
              scale={0.5}
            />
          </Float>
          <FloatingPowerups />
        </DecorativeCanvas>
      </div>
      <div className="relative z-10">
        <SiteHeader
          current="games"
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
        />
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link href="/" className="inline-block rounded-xl border px-4 py-2">
            Back Home
          </Link>
          <header className="py-8 text-center">
            <FaGamepad
              aria-hidden="true"
              className="mx-auto mb-4 text-6xl text-purple-500"
            />
            <h1 className="text-4xl font-black sm:text-6xl">ARCADE ZONE</h1>
            <p className="mt-4 text-xl">Play, learn and try again.</p>
            <p className="mx-auto mt-3 max-w-2xl">
              Scores and difficulty labels describe gameplay, not safety
              qualifications. These games do not award account badges or update
              the demo leaderboard.
            </p>
          </header>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} darkMode={darkMode} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
