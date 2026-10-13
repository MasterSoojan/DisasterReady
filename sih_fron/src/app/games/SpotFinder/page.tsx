"use client";

import { useState } from "react";
import { GameExit } from "@/features/games/GameExit";
import { roomSpots } from "@/features/games/spot-finder/engine";
import { rooms } from "@/features/games/spot-finder/rooms";
import {
  SpotFinderScene,
  SpotFinderResult,
} from "@/features/games/spot-finder/SpotFinderView";
import styles from "@/features/games/spot-finder/SpotFinder.module.css";

/** Game flow only; authored rules/data and scene presentation remain separate. */
export default function SpotFinder3D() {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [randomizedSpots, setRandomizedSpots] = useState(() =>
    roomSpots(rooms[0], () => 0.75),
  );
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");

  const handleChoice = (isSafe: boolean) => {
    if (answered) return;
    setAnswered(true);
    setScore((prev) => prev + (isSafe ? 100 : -20)); // Adjusted scoring for "arcade" feel
  };

  const handleNextRoom = () => {
    const nextRoomIndex = currentRoomIndex + 1;
    if (nextRoomIndex < rooms.length) {
      setCurrentRoomIndex(nextRoomIndex);
      setRandomizedSpots(roomSpots(rooms[nextRoomIndex]));
      setAnswered(false);
    } else {
      setGameState("finished");
    }
  };

  const restartGame = () => {
    setScore(0);
    setCurrentRoomIndex(0);
    setRandomizedSpots(roomSpots(rooms[0]));
    setAnswered(false);
    setGameState("playing");
  };

  return (
    <div className={styles.game}>
      <GameExit />
      <main className={styles.container}>
        <h1 className="sr-only">Safe Spot Finder 3D</h1>

        {gameState === "playing" ? (
          <SpotFinderScene
            randomizedSpots={randomizedSpots}
            room={rooms[currentRoomIndex]}
            score={score}
            answered={answered}
            onChoice={handleChoice}
            onNext={handleNextRoom}
            isLastRoom={currentRoomIndex === rooms.length - 1}
          />
        ) : (
          <SpotFinderResult score={score} onRestart={restartGame} />
        )}
      </main>
    </div>
  );
}
