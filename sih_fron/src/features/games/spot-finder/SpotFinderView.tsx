import React, { type FC } from "react";
import type { SpotData, RoomData } from "./rooms";
import { objectVisuals } from "./objectVisuals";
import styles from "./SpotFinder.module.css";

const Spot: FC<{
  spot: SpotData & { isSafe: boolean };
  isAnswered: boolean;
  onSelect: () => void;
}> = ({ spot, isAnswered, onSelect }) => {
  // If this specific spot was clicked/answered
  const stateClass = isAnswered
    ? spot.isSafe
      ? styles["spot-safe"]
      : styles["spot-unsafe"]
    : "";

  const handleClick = () => {
    if (!isAnswered) {
      onSelect();
    }
  };

  return (
    <div
      className={`${styles["spot-3d-container"]} ${stateClass}`}
      style={
        {
          left: `${spot.x}px`,
          top: `${spot.y}px`,
          width: `${spot.w}px`,
          height: `${spot.h}px`,
          "--spot-theme": isAnswered
            ? spot.isSafe
              ? "var(--safe-color)"
              : "var(--unsafe-color)"
            : "var(--neutral-card)",
        } as React.CSSProperties
      }
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      aria-disabled={isAnswered}
      tabIndex={isAnswered ? -1 : 0}
    >
      <div className={styles["spot-3d-face"]}>
        <div className={styles["icon-wrapper"]}>
          {objectVisuals[spot.label]}
        </div>
        <div className={styles["label-plate"]}>{spot.label}</div>
      </div>
      <div className="spot-shadow"></div>
    </div>
  );
};

export const SpotFinderScene: FC<{
  randomizedSpots: (SpotData & { isSafe: boolean })[];
  room: RoomData;
  score: number;
  answered: boolean;
  onChoice: (isSafe: boolean) => void;
  onNext: () => void;
  isLastRoom: boolean;
}> = ({
  room,
  randomizedSpots,
  score,
  answered,
  onChoice,
  onNext,
  isLastRoom,
}) => {
  return (
    <>
      <div className={styles["hud-layer"]}>
        <div className={styles["score-board"]}>
          <span className={styles["score-label"]}>SAFETY SCORE</span>
          <span
            role="status"
            aria-label="Safety score"
            aria-live="polite"
            className={styles["score-value"]}
          >
            {score}
          </span>
        </div>
      </div>

      <div className={styles["scene-container"]}>
        <div
          className={styles["room-floor"]}
          style={{ "--floor-accent": room.themeColor } as React.CSSProperties}
        >
          <div className={styles["room-label"]}>
            <h2>{room.name}</h2>
            <p>Where is the safe spot?</p>
          </div>

          {/* Grid lines for 3D effect */}
          <div className={styles["grid-overlay"]}></div>

          {randomizedSpots.map((spot, i) => (
            <Spot
              key={`spot-${room.name}-${i}`}
              spot={spot}
              isAnswered={answered}
              onSelect={() => onChoice(spot.isSafe)}
            />
          ))}

          {answered && (
            <div className={styles["feedback-overlay"]}>
              {randomizedSpots.map((spot, i) => {
                if (!spot.isSafe && !spot.feedback) return null; // Logic check

                // Position bubble relative to the spot in 3D space is hard, so we use absolute overlay
                // We map the bubble to the spot's center
                const isWinningSpot = spot.isSafe;

                return (
                  <div
                    key={`fb-${i}`}
                    className={`${styles["feedback-card"]} ${isWinningSpot ? styles.success : styles.danger}`}
                    style={{
                      left: spot.x + spot.w / 2 - 100, // Centered roughly
                      top: spot.y - 60,
                    }}
                  >
                    {spot.feedback}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {answered && (
        <div className={styles["controls-layer"]}>
          <button className={styles["next-btn-3d"]} onClick={onNext}>
            {isLastRoom ? "FINISH MISSION" : "NEXT LEVEL ➔"}
          </button>
        </div>
      )}
    </>
  );
};

export const SpotFinderResult: FC<{ score: number; onRestart: () => void }> = ({
  score,
  onRestart,
}) => (
  <div className={styles["result-layer"]}>
    <div className={styles["result-card-3d"]}>
      <div className={styles["result-header"]}>MISSION REPORT</div>
      <div className="final-score-container">
        <div className={styles["score-circle"]}>{score}</div>
      </div>
      <p>
        {score > 50 ? "Excellent survival skills!" : "You need more training."}
      </p>
      <button className={styles["restart-btn-3d"]} onClick={onRestart}>
        REPLAY SIMULATION
      </button>
    </div>
  </div>
);
