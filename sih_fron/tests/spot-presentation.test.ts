import { createHash } from "node:crypto";
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { rooms } from "../src/features/games/spot-finder/rooms";
import { objectVisuals } from "../src/features/games/spot-finder/objectVisuals";

it("keeps every authored object's SVG markup identical to the pre-extraction page", () => {
  // Captured from the original page's React-rendered SVGs before extraction.
  // This checks preservation, not ownership/licensing or instructional accuracy.
  const markup = Object.keys(objectVisuals)
    .sort()
    .map((label) => [label, renderToStaticMarkup(objectVisuals[label])]);
  expect(
    createHash("sha256").update(JSON.stringify(markup)).digest("hex"),
  ).toBe("dcf1a4f957c8f99ecf5f88d815372a8b5256eb1b09ee2c4922c637ba024e6305");
});

it("provides exactly the visuals used by the authored rooms", () => {
  const labels = new Set(
    rooms.flatMap((room) =>
      [...room.safeSpots, ...room.unsafeSpots].map((spot) => spot.label),
    ),
  );
  expect(Object.keys(objectVisuals).sort()).toEqual([...labels].sort());
  for (const label of labels)
    expect(isValidElement(objectVisuals[label])).toBe(true);
});

it("shares the identical desk, shelf and wall shapes without a generic renderer", () => {
  expect(objectVisuals.Desk).toBe(objectVisuals.Table);
  expect(objectVisuals.Desk).toBe(objectVisuals["Sturdy Desk"]);
  expect(objectVisuals.Shelf).toBe(objectVisuals["Tall Bookshelf"]);
  expect(objectVisuals.Wall).toBe(objectVisuals["Against Interior Wall"]);
});
