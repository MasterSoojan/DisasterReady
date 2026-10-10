"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit, FiLogOut } from "react-icons/fi";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { DemoAccountGate } from "@/features/accounts/DemoAccountGate";
import { DemoNotice } from "@/features/accounts/DemoNotice";
import { AccountStats } from "@/features/accounts/AccountStats";
import { DashboardScene } from "@/features/accounts/Scenes";
import { ProfileEditor } from "@/features/accounts/ProfileEditor";
import { isAvatarData } from "@/features/accounts/avatar";
import { signOutDemo, type DemoUser } from "@/features/accounts/demoUsers";

export default function Dashboard() {
  return (
    <DemoAccountGate>
      {(user, users) => (
        <DashboardContent key={user.username} user={user} users={users} />
      )}
    </DemoAccountGate>
  );
}
function DashboardContent({
  user,
  users,
}: {
  user: DemoUser;
  users: DemoUser[];
}) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useDarkMode();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
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
      className={`relative min-h-screen overflow-hidden pb-12 ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-slate-900"}`}
    >
      <div className="pointer-events-none fixed inset-0">
        <DecorativeCanvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} intensity={1} />
          <DashboardScene darkMode={darkMode} />
        </DecorativeCanvas>
      </div>
      <div className="relative z-10">
        <SiteHeader
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
          current="account"
        />
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link href="/" className="inline-block rounded-xl border px-4 py-2">
            Back Home
          </Link>
          <header className="py-8 text-center">
            <h1 className="text-4xl font-black sm:text-5xl">Command Center</h1>
            <p className="mt-3 break-words text-xl">
              Welcome, {user.username}. Your local demo role is {user.role}.
            </p>
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
          <div className="flex flex-col gap-8 lg:flex-row">
            <section
              aria-label="Demo profile"
              className={`min-w-0 rounded-3xl p-6 text-center shadow-xl lg:w-1/3 ${darkMode ? "bg-gray-800/80" : "bg-white/90"}`}
            >
              {isAvatarData(user.avatar) ? (
                <Image
                  width={160}
                  height={160}
                  unoptimized
                  src={user.avatar}
                  alt="Saved avatar"
                  className="mx-auto mb-5 h-40 w-40 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-label="Initial avatar"
                  className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-full bg-purple-700 text-6xl font-bold text-white"
                >
                  {user.username.trim()[0].toUpperCase()}
                </div>
              )}
              <h2 className="break-words text-3xl font-bold">
                {user.username}
              </h2>
              <p className="my-3 break-words">
                {user.email || "No email recorded"}
              </p>
              {user.avatar && !isAvatarData(user.avatar) && (
                <p className="mb-4 text-sm">
                  The legacy avatar is unavailable. Edit your profile to replace
                  or remove it.
                </p>
              )}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setEditing(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white"
                >
                  <FiEdit />
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-600 px-4 py-3 font-bold text-red-600"
                >
                  <FiLogOut />
                  Log out
                </button>
                {user.role === "teacher" && (
                  <Link
                    href="/leaderboard"
                    className="rounded-xl border px-4 py-3 font-semibold"
                  >
                    Open demo leaderboard
                  </Link>
                )}
              </div>
            </section>
            <AccountStats user={user} users={users} darkMode={darkMode} />
          </div>
        </div>
      </div>
      {editing && (
        <ProfileEditor user={user} onClose={() => setEditing(false)} />
      )}
    </main>
  );
}
