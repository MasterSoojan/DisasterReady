"use client";
import Link from "next/link";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { WeatherScene } from "@/features/home/Scene";
import { homeFeatures } from "@/features/home/content";

export default function HomePage() {
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <main
      className={
        "min-h-screen pb-8 transition-colors " +
        (darkMode
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-b from-pink-100 via-blue-100 to-yellow-100 text-slate-900")
      }
    >
      <SiteHeader
        current="home"
        darkMode={darkMode}
        toggleTheme={() => setDarkMode(!darkMode)}
      />
      <section
        className={
          "relative mx-4 mt-4 overflow-hidden rounded-3xl px-5 py-16 text-center sm:py-24 " +
          (darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-sky-200 via-sky-300 to-blue-300")
        }
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <DecorativeCanvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <WeatherScene darkMode={darkMode} />
          </DecorativeCanvas>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <p
            className={
              "mb-4 font-semibold " +
              (darkMode ? "text-cyan-200" : "text-indigo-900")
            }
          >
            An educational prototype
          </p>
          <h1
            className={
              "text-4xl font-extrabold sm:text-6xl " +
              (darkMode ? "text-indigo-200" : "text-indigo-950")
            }
          >
            Learn Safety in a Fun Way! 🌈
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg">
            Explore disaster-preparedness topics through colorful lessons,
            quizzes and practice games.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base">
            This is not an emergency response service or certified safety
            training. Learning content needs independent review before
            real-world use.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/modules"
              className="rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white"
            >
              Explore lessons
            </Link>
            <Link
              href="/games"
              className="rounded-xl bg-white px-5 py-3 font-bold text-indigo-900"
            >
              Browse games
            </Link>
            <Link
              href="/help"
              className="rounded-xl border border-current px-5 py-3 font-bold"
            >
              Help &amp; official resources
            </Link>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-14"
      >
        <h2
          id="features-heading"
          className="mb-8 text-center text-3xl font-extrabold"
        >
          Explore the prototype
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeFeatures.map(({ title, description, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={
                "rounded-3xl p-6 shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 " +
                (darkMode ? "bg-indigo-950" : "bg-white/90")
              }
            >
              <Icon
                aria-hidden="true"
                className={
                  "mb-4 text-4xl " +
                  (darkMode ? "text-cyan-200" : "text-purple-700")
                }
              />
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="limits-heading"
        className={
          "mx-4 rounded-3xl px-5 py-10 text-center " +
          (darkMode ? "bg-gray-800" : "bg-white/80")
        }
      >
        <h2 id="limits-heading" className="text-2xl font-bold">
          What to expect
        </h2>
        <div className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-bold">Practice, not certification</h3>
            <p className="mt-2">
              No verified training outcomes, school adoption figures or learner
              improvement metrics are published here.
            </p>
          </div>
          <div>
            <h3 className="font-bold">No live alerts or dispatch</h3>
            <p className="mt-2">
              This app does not detect your location, issue disaster warnings or
              send emergency responders.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Clear storage limits</h3>
            <p className="mt-2">
              Demo profiles stay in this browser. Learning progress resets when
              you leave; connected chat stores messages in the configured
              backend.
            </p>
          </div>
        </div>
      </section>
      <footer className="mt-8 px-4 text-center text-sm">
        DisasterReady · Educational prototype
      </footer>
    </main>
  );
}
