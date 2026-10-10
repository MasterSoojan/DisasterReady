"use client";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DemoUser } from "./demoUsers";
import { useDemoAccounts } from "./useDemoAccounts";
import { DemoNotice } from "./DemoNotice";

/** Navigation convenience only. Editable browser storage never authorizes server access. */
export function DemoAccountGate({
  children,
  teacherOnly = false,
}: {
  children: (user: DemoUser, users: DemoUser[]) => ReactNode;
  teacherOnly?: boolean;
}) {
  const router = useRouter();
  const state = useDemoAccounts();
  const allowed = state.user && (!teacherOnly || state.user.role === "teacher");
  useEffect(() => {
    if (!state.loading && !state.error && !allowed) router.replace("/account");
  }, [state.loading, state.error, allowed, router]);
  if (state.error)
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">Demo account unavailable</h1>
        <DemoNotice />
        <p role="alert">{state.error}</p>
        <Link href="/account" className="mt-4 inline-block underline">
          Back to demo accounts
        </Link>
      </main>
    );
  return allowed && state.user ? (
    children(state.user, state.users)
  ) : (
    <p role="status" className="p-6">
      Checking local demo account…
    </p>
  );
}
