"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stars, Sparkles } from "@react-three/drei";
import { DemoAccountGate } from "@/features/accounts/DemoAccountGate";
import { DemoNotice } from "@/features/accounts/DemoNotice";
import { Trophy, FloatingShapes } from "@/features/accounts/Scenes";
import {
  rankDemoStudents,
  recordedScore,
  recordedImprovement,
} from "@/features/accounts/statistics";
import { signOutDemo, type DemoUser } from "@/features/accounts/demoUsers";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { SiteHeader } from "@/features/navigation/SiteHeader";

export default function Leaderboard() {
  return (
    <DemoAccountGate teacherOnly>
      {(_, users) => <LeaderboardContent users={users} />}
    </DemoAccountGate>
  );
}
function LeaderboardContent({ users }: { users: DemoUser[] }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useDarkMode();
  const [error, setError] = useState("");
  const students = rankDemoStudents(users);
  const ranked = students.filter((student) => student.rank !== null);
  const logout = () => {
    try {
      signOutDemo(localStorage);
      router.push("/account");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to end the local session.",
      );
    }
  };
  return (
    <main
      className={`relative min-h-screen overflow-hidden pb-12 ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 to-blue-100 text-slate-900"}`}
    >
      <div className="pointer-events-none fixed inset-0">
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
            count={80}
            scale={12}
            size={4}
            speed={0.4}
            opacity={0.5}
            color="yellow"
          />
          <Trophy darkMode={darkMode} />
          <FloatingShapes count={15} darkMode={darkMode} />
        </DecorativeCanvas>
      </div>
      <div className="relative z-10">
        <SiteHeader
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
          current="leaderboard"
        />
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link
            href="/account/dashboard"
            className="inline-block rounded-xl border px-4 py-2 print:hidden"
          >
            Back to profile
          </Link>
          <header className="my-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black sm:text-5xl">
                Demo leaderboard
              </h1>
              <p className="mt-3">
                Editable records on this device—not verified learner
                performance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white print:hidden"
            >
              Print demo report
            </button>
          </header>
          <DemoNotice />
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-4 text-red-800"
            >
              {error}
            </p>
          )}
          {ranked.length ? (
            <section
              aria-label="Recorded top scores"
              className="my-8 flex flex-wrap items-end justify-center gap-4"
            >
              {[1, 0, 2].map(
                (index) =>
                  ranked[index] && (
                    <div
                      key={ranked[index].user.username}
                      className={`w-40 rounded-t-2xl border-t-4 p-5 text-center shadow-xl ${index === 0 ? "border-yellow-500 bg-yellow-100 text-yellow-950" : "border-slate-400 bg-slate-100 text-slate-900"}`}
                    >
                      <p className="text-2xl font-black">
                        #{ranked[index].rank}
                      </p>
                      <p className="my-3 break-words font-bold">
                        {ranked[index].user.username}
                      </p>
                      <p>{recordedScore(ranked[index].user)}</p>
                    </div>
                  ),
              )}
            </section>
          ) : (
            <p className="my-6">
              No recorded quiz results to rank. Accounts without results remain
              unranked.
            </p>
          )}
          <section
            aria-label="Local demo leaderboard"
            className={`min-w-0 overflow-hidden rounded-3xl p-4 shadow-xl ${darkMode ? "bg-gray-800/80" : "bg-white/90"}`}
          >
            {students.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <caption className="mb-4 text-left text-sm">
                    Ranks use stored average percentages only when at least one
                    quiz is recorded. These values are not verified or generated
                    by the current quiz.
                  </caption>
                  <thead>
                    <tr>
                      {[
                        "Rank",
                        "Student",
                        "Quizzes",
                        "Average score",
                        "Recorded improvement",
                        "Recorded badges",
                      ].map((title) => (
                        <th key={title} scope="col" className="p-3">
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(({ user, rank }) => (
                      <tr
                        key={user.username}
                        className="border-t border-slate-400/30"
                      >
                        <td className="p-3">
                          {rank === null ? "Unranked" : `#${rank}`}
                        </td>
                        <th scope="row" className="break-words p-3">
                          {user.username}
                        </th>
                        <td className="p-3">{user.totalQuizzes ?? "—"}</td>
                        <td className="p-3">{recordedScore(user)}</td>
                        <td className="p-3">{recordedImprovement(user)}</td>
                        <td className="p-3">
                          {user.badges?.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No local student accounts.</p>
            )}
          </section>
          <button
            type="button"
            onClick={logout}
            className="mx-auto mt-8 block rounded-xl bg-red-700 px-6 py-3 font-bold text-white print:hidden"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
