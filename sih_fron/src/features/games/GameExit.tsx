import Link from "next/link";

/** A consistent keyboard-accessible exit from full-screen learning games. */
export function GameExit() {
  return (
    <Link
      href="/games"
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 200,
        padding: "8px 12px",
        borderRadius: 8,
        background: "#0f172a",
        color: "#fff",
        border: "1px solid #64748b",
        fontSize: 14,
      }}
    >
      ← All games
    </Link>
  );
}
