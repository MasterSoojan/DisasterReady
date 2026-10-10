"use client";
import { useBlazeGame } from "@/features/games/blaze-escape/useBlazeGame";
import { GameExit } from "@/features/games/GameExit";

export default function BlazeEscape() {
  const {
    canvasRef,
    gameState,
    currentLevelIndex,
    player,
    message,
    audioStatus,
    handleStart,
    handleUseExtinguisher,
    handleMouseUp,
  } = useBlazeGame();

  // --- Render JSX ---
  const getHealthBarColor = () => {
    if (!player || player.health > 50) return "bg-green-500";
    if (player.health > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col justify-center items-center min-h-screen overflow-hidden font-mono">
      <GameExit />
      <style>{`
                body { touch-action: none; }
                .progress-bar-container { background-color: rgba(255, 255, 255, 0.2); border-radius: 9999px; overflow: hidden; }
                .progress-bar { transition: width 0.3s ease-in-out; }
            `}</style>

      {gameState === "playing" && player && (
        <div
          id="game-ui"
          className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 w-full max-w-4xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/50 p-3 rounded-lg backdrop-blur-sm">
            <h1 className="text-xl font-bold text-orange-400">Blaze Escape</h1>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">
                LEVEL {currentLevelIndex + 1}
              </span>
              {player.hasKey && (
                <span className="text-2xl" title="Key Acquired">
                  🔑
                </span>
              )}
            </div>
            <div className="w-full sm:w-1/3">
              <span className="text-sm font-semibold">HEALTH</span>
              <div className="progress-bar-container">
                <div
                  className={`progress-bar h-4 ${getHealthBarColor()} rounded-full`}
                  style={{ width: `${player.health}%` }}
                ></div>
              </div>
            </div>
            <div className="w-full sm:w-1/3">
              <span className="text-sm font-semibold">SMOKE LEVEL</span>
              <div className="progress-bar-container">
                <div
                  className="progress-bar h-4 bg-gray-400 rounded-full"
                  style={{ width: `${player.smokeLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
          {message && (
            <p className="text-center mt-4 text-lg font-bold text-yellow-300 animate-pulse">
              {message}
            </p>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-label="Blaze Escape playfield"
        className="bg-[#1a1a1a] cursor-crosshair rounded-lg max-w-[90vw] max-h-[calc(100vh-150px)] object-contain"
        onPointerDown={handleUseExtinguisher}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseUp}
      />

      {gameState === "start" && (
        <div
          id="startScreen"
          className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20 text-center p-4"
        >
          <h1 className="text-5xl font-bold mb-4 text-orange-500 tracking-wider">
            BLAZE ESCAPE
          </h1>
          <p className="text-lg mb-6 max-w-md">
            You&apos;ve woken up in a burning building. Find the fire
            extinguisher and get to the exit before it&apos;s too late!
          </p>
          <div className="mb-4">
            <h2 className="font-bold text-xl mb-2">Controls:</h2>
            <p>
              <kbd className="px-2 py-1 bg-gray-700 rounded">ARROW KEYS</kbd> or{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded">WASD</kbd> to move.
            </p>
            <p>
              <kbd className="px-2 py-1 bg-gray-700 rounded">CLICK</kbd> to use
              the fire extinguisher.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            START
          </button>
          <p role="status" className="mt-3 text-sm text-gray-300">
            {audioStatus}
          </p>
        </div>
      )}

      {(gameState === "gameOver" || gameState === "win") && (
        <div
          id="gameOverScreen"
          className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center z-20 text-center p-4"
        >
          <h1
            className={`text-6xl font-bold mb-4 ${gameState === "win" ? "text-green-500" : "text-red-600"}`}
          >
            {gameState === "win" ? "YOU ESCAPED!" : "GAME OVER"}
          </h1>
          <p className="text-xl mb-8">
            {gameState === "win"
              ? "You made it out alive. Congratulations!"
              : "The fire consumed you."}
          </p>
          <button
            onClick={handleStart}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
}
