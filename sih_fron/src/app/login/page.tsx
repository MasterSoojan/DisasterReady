"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      router.replace("/leaderboard");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const teacher = users.find(
      (u: any) => u.username === username && u.password === password && u.role === "teacher"
    );

    if (teacher) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminName", teacher.username);
      router.push("/leaderboard");
    } else {
      setError("❌ Invalid username or password or not a teacher");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-300 p-6 relative overflow-hidden">
      <div className="absolute w-72 h-72 bg-purple-400/30 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-sky-400/30 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 z-10">
        <h1 className="text-3xl font-extrabold mb-3 text-center bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 text-red-500 text-center font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="👤 Username"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/70 transition-all duration-300"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="🔒 Password"
            type="password"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/70 transition-all duration-300"
            autoComplete="current-password"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
