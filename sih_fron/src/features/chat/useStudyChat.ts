"use client";
import { useEffect, useRef, useState } from "react";
import { chatApiConfigured, sendChat } from "@/lib/api";

type Message = { sender: "bot" | "user"; text: string };
const greeting: Message = {
  sender: "bot",
  text: "Welcome to Study Buddy. This is a rule-based learning prototype, not live support or emergency advice.",
};

export function useStudyChat() {
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );
  const send = async () => {
    const message = input.trim();
    if (!message || active.current) return;
    if (message.length > 4000) {
      setError("Write a message of 1–4000 characters.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setError("");
    try {
      const text = chatApiConfigured
        ? (await sendChat(message, controller.signal)).bot_response
        : "Demo only: no message was sent. Connect the FastAPI backend for keyword-based learning replies. For an emergency, use official services where you are.";
      if (controller.signal.aborted) return;
      setMessages((previous) => [
        ...previous,
        { sender: "user", text: message },
        { sender: "bot", text },
      ]);
      setInput("");
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error ? failure.message : "Chat is unavailable.",
        );
    } finally {
      if (active.current === controller) {
        active.current = null;
        setPending(false);
      }
    }
  };
  const cancel = () => {
    active.current?.abort();
    active.current = null;
    setPending(false);
    setError(
      "Waiting cancelled. A connected backend may already have stored the message; cancelling does not erase it.",
    );
  };
  return {
    messages,
    input,
    setInput,
    pending,
    error,
    send,
    cancel,
    connected: chatApiConfigured,
  };
}
