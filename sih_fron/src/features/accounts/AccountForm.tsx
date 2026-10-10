"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerDemo, signInDemo, type DemoUser } from "./demoUsers";
import { useDemoAccounts } from "./useDemoAccounts";
import { DemoNotice } from "./DemoNotice";

export function AccountForm({
  teacherOnly = false,
}: {
  teacherOnly?: boolean;
}) {
  const router = useRouter();
  const accounts = useDemoAccounts();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<DemoUser["role"]>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const locked = useRef(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked.current || accounts.loading || accounts.error) return;
    locked.current = true;
    setSubmitting(true);
    setError("");
    try {
      if (mode === "signup" && !teacherOnly)
        registerDemo(localStorage, username, password, role);
      else signInDemo(localStorage, username, password, teacherOnly);
      setPassword("");
      router.push(teacherOnly ? "/leaderboard" : "/account/dashboard");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to save the local demo session.",
      );
      locked.current = false;
      setSubmitting(false);
    }
  };
  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-2 focus:outline-indigo-600";
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 text-slate-900">
      <section className="w-full max-w-lg rounded-3xl border border-white/40 bg-white/90 p-6 shadow-xl sm:p-8">
        <Link
          href="/"
          className="mb-5 inline-block rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white"
        >
          Back Home
        </Link>
        <h1 className="text-3xl font-extrabold text-indigo-900">
          {teacherOnly ? "Teacher demo login" : "Demo accounts"}
        </h1>
        <DemoNotice />
        {accounts.user && (
          <p className="mb-4">
            Signed in locally as {accounts.user.username}.{" "}
            <Link href="/account/dashboard" className="underline">
              Open profile
            </Link>
          </p>
        )}
        {!teacherOnly && (
          <div className="mb-5 flex gap-2">
            {(["login", "signup"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                disabled={submitting}
                onClick={() => {
                  setMode(value);
                  setError("");
                  setPassword("");
                }}
                className={`rounded-xl px-4 py-2 font-semibold ${mode === value ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-900"}`}
              >
                {value === "login" ? "Sign in" : "Create demo account"}
              </button>
            ))}
          </div>
        )}
        {(accounts.error || error) && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-red-800"
          >
            {accounts.error || error}
          </p>
        )}
        <form onSubmit={submit}>
          <fieldset
            disabled={accounts.loading || !!accounts.error || submitting}
            className="min-w-0 space-y-4"
          >
            <label className="block font-semibold">
              Username
              <input
                required
                maxLength={80}
                autoComplete="off"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block font-semibold">
              Demo password
              <input
                required
                maxLength={128}
                type="password"
                autoComplete="off"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </label>
            {mode === "signup" && !teacherOnly && (
              <label className="block font-semibold">
                Demo role
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as DemoUser["role"])
                  }
                  className={fieldClass}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              {submitting
                ? "Opening demo…"
                : mode === "signup" && !teacherOnly
                  ? "Create and open demo"
                  : "Open demo"}
            </button>
          </fieldset>
        </form>
        <p className="mt-5 text-sm">
          No default admin account is created.{" "}
          {teacherOnly ? (
            <Link href="/account" className="underline">
              Create a local demo account
            </Link>
          ) : (
            <Link href="/login" className="underline">
              Teacher demo login
            </Link>
          )}
        </p>
      </section>
    </main>
  );
}
