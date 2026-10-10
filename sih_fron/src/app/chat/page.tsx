"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Stars } from "@react-three/drei";
import { FiSend } from "react-icons/fi";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { CharacterDisplay } from "@/features/chat/Scene";
import { useStudyChat } from "@/features/chat/useStudyChat";

export default function ChatPage() {
  const [darkMode, setDarkMode] = useDarkMode();
  const chat = useStudyChat();
  const transcript = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Scroll the transcript, not the document or the focused input; no forced smooth motion.
    const element = transcript.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [chat.messages, chat.pending]);
  return (
    <main
      className={
        "relative min-h-screen pb-10 " +
        (darkMode ? "bg-gray-950 text-white" : "bg-blue-50 text-slate-900")
      }
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <DecorativeCanvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            fade
            speed={1.5}
          />
          <group position={[-2.8, 0, 0]}>
            <CharacterDisplay isTyping={chat.pending} />
          </group>
        </DecorativeCanvas>
      </div>
      <div className="relative z-10">
        <SiteHeader
          current="chat"
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
        />
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link href="/" className="inline-block rounded-xl border px-4 py-2">
            Back Home
          </Link>
          <section
            aria-labelledby="chat-heading"
            className={
              "ml-auto mt-6 flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border shadow-2xl " +
              (darkMode
                ? "border-white/20 bg-gray-900/95"
                : "border-blue-200 bg-white/95")
            }
          >
            <header className="flex items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white">
              <Image
                width={48}
                height={48}
                unoptimized
                alt=""
                src="/robot-girl.png"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 id="chat-heading" className="text-2xl font-bold">
                  Study Buddy
                </h1>
                <p className="mt-1 text-sm">
                  {chat.connected
                    ? "Configured backend — rule-based replies"
                    : "Demo — backend not connected"}
                </p>
              </div>
            </header>
            <div className="border-b border-slate-400/30 p-4 text-sm leading-relaxed">
              <p>
                Not live support, generative AI or an emergency service. Do not
                share passwords, health details or other private information.
              </p>
              <p className="mt-2">
                {chat.connected
                  ? "Sending transmits your message to the configured backend, which stores it in its database. No automatic erasure is provided."
                  : "Demo messages stay on this page; nothing is sent to a chat backend."}
              </p>
              <Link
                href="/help#emergency-resources"
                className="mt-2 inline-block underline"
              >
                Official emergency resources
              </Link>
            </div>
            <div
              ref={transcript}
              role="log"
              aria-label="Study conversation"
              aria-relevant="additions"
              className="h-72 overflow-y-auto p-4 sm:h-80"
            >
              <ol className="space-y-4">
                {chat.messages.map((message, index) => (
                  <li
                    key={index}
                    className={
                      "flex " +
                      (message.sender === "user"
                        ? "justify-end"
                        : "justify-start")
                    }
                  >
                    <div
                      className={
                        "max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm " +
                        (message.sender === "user"
                          ? "bg-blue-700 text-white"
                          : darkMode
                            ? "bg-gray-800 text-white"
                            : "bg-indigo-50 text-slate-900")
                      }
                    >
                      <span className="mb-1 block font-bold">
                        {message.sender === "user" ? "You" : "Study Buddy"}
                      </span>
                      {message.text}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border-t border-slate-400/30 p-4">
              {chat.pending && (
                <p role="status" className="mb-3 text-sm">
                  Waiting for a reply…
                </p>
              )}
              {chat.error && (
                <div
                  role="alert"
                  className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-900"
                >
                  <p>{chat.error}</p>
                  {chat.connected && (
                    <p className="mt-2">
                      A dispatched message may already be stored. Re-sending can
                      create another record; there is no automatic retry.
                    </p>
                  )}
                </div>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void chat.send();
                }}
              >
                <label
                  htmlFor="study-message"
                  className="mb-2 block font-semibold"
                >
                  Your study message
                </label>
                <div className="flex gap-2">
                  <input
                    id="study-message"
                    value={chat.input}
                    onChange={(event) => chat.setInput(event.target.value)}
                    readOnly={chat.pending}
                    maxLength={4000}
                    aria-describedby="chat-input-help"
                    className={
                      "min-w-0 flex-1 rounded-xl border px-3 py-3 focus-visible:outline-2 " +
                      (darkMode
                        ? "border-white/30 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-slate-900")
                    }
                  />
                  <button
                    type="submit"
                    disabled={chat.pending || !chat.input.trim()}
                    aria-label="Send study message"
                    className="rounded-xl bg-blue-700 px-4 py-3 text-white disabled:opacity-50"
                  >
                    <FiSend aria-hidden="true" />
                  </button>
                </div>
                <p id="chat-input-help" className="mt-2 text-sm">
                  Up to 4,000 characters. Conversation display resets when you
                  leave.
                </p>
                {chat.pending && (
                  <button
                    type="button"
                    onClick={chat.cancel}
                    className="mt-3 rounded-xl border px-4 py-2"
                  >
                    Cancel waiting
                  </button>
                )}
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
