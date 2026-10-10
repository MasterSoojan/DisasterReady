import type { RoomData } from "./rooms";

/** Shuffle presentation order, never the authored coordinates or safety labels. */
export function roomSpots(room: RoomData, random = Math.random) {
  const spots = [
    { ...room.safeSpots[0], isSafe: true },
    { ...room.unsafeSpots[0], isSafe: false },
  ];
  return random() < 0.5 ? spots.reverse() : spots;
}
