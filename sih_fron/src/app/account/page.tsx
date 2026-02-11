"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("users")) {
      const initialUsers = [
        { username: "admin", password: "1234", role: "teacher" }, // PLACEHOLDERS
      ];
      localStorage.setItem("users", JSON.stringify(initialUsers));
    }
  }, []);

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u: any) => u.username === username && u.password === password
    );
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      router.push("/account/dashboard");
    } else {
      setError("❌ Invalid username or password");
    }
  };

  const handleSignup = () => {
    if (!username || !password || !role) return setError("⚠️ Fill all fields");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find((u: any) => u.username === username);
    if (exists) return setError("❌ Username already exists");

    const newUser = { username, password, role };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    router.push("/account/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 relative overflow-hidden">
      <div className="absolute w-72 h-72 bg-purple-400/30 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-sky-400/30 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 z-10 relative">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold mb-3 text-center bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
          {isLogin ? "Login Account" : "Sign Up"}
        </h1>

        {error && (
          <div className="mb-4 text-red-500 text-center font-medium">{error}</div>
        )}

        <div className="flex justify-center mb-4">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`px-4 py-2 font-semibold rounded-l-xl ${isLogin ? "bg-indigo-600 text-white" : "bg-white text-indigo-600"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`px-4 py-2 font-semibold rounded-r-xl ${!isLogin ? "bg-indigo-600 text-white" : "bg-white text-indigo-600"}`}
          >
            Sign Up
          </button>
        </div>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="👤 Username"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4 bg-white/70"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="🔒 Password"
          type="password"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4 bg-white/70"
        />

        {!isLogin && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4 bg-white/70"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition transform mb-2"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
