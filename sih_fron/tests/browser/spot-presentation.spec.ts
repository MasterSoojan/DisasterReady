import { test, expect } from "./fixtures";
import { rooms } from "../../src/features/games/spot-finder/rooms";

test("every room preserves its objects, geometry, feedback and answered styles", async ({
  page,
}) => {
  await page.goto("/games/SpotFinder");
  let score = 0;
  for (const [index, room] of rooms.entries()) {
    await expect(
      page.getByRole("heading", { name: room.name, exact: true }),
    ).toBeVisible();
    for (const spot of [...room.safeSpots, ...room.unsafeSpots]) {
      const target = page.getByRole("button", {
        name: spot.label,
        exact: true,
      });
      await expect(target.locator("svg")).toHaveCount(1);
      await expect(target).toHaveAttribute("aria-disabled", "false");
      expect(
        await target.evaluate((element) => {
          const style = (element as HTMLElement).style;
          return [style.left, style.top, style.width, style.height];
        }),
      ).toEqual([`${spot.x}px`, `${spot.y}px`, `${spot.w}px`, `${spot.h}px`]);
    }
    const safe = index % 2 === 0;
    const choice = (safe ? room.safeSpots : room.unsafeSpots)[0];
    await page.getByRole("button", { name: choice.label, exact: true }).click();
    score += safe ? 100 : -20;
    await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
      String(score),
    );
    for (const spot of [...room.safeSpots, ...room.unsafeSpots]) {
      const target = page.getByRole("button", {
        name: spot.label,
        exact: true,
      });
      await expect(target).toHaveAttribute("aria-disabled", "true");
      await expect(target).toHaveAttribute("tabindex", "-1");
      await expect(
        page.getByText(spot.feedback, { exact: true }),
      ).toBeVisible();
      const background = await target
        .locator(":scope > div")
        .first()
        .evaluate((element) => getComputedStyle(element).backgroundImage);
      expect(background).toContain(
        room.safeSpots.includes(spot) ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
      );
    }
    await page
      .getByRole("button", {
        name: index === rooms.length - 1 ? "FINISH MISSION" : /NEXT LEVEL/,
      })
      .click();
  }
  await expect(page.getByText("MISSION REPORT", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "REPLAY SIMULATION", exact: true })
    .click();
  await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
    "0",
  );
});

test("Space selects once and game styles do not override body or survive exit", async ({
  page,
}) => {
  await page.goto("/games");
  const bodyStyle = () =>
    page.locator("body").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        overflow: style.overflow,
        font: style.fontFamily,
        gameColor: style.getPropertyValue("--safe-color"),
      };
    });
  const before = await bodyStyle();
  await page.goto("/games/SpotFinder");
  expect(await bodyStyle()).toEqual(before);
  await expect(
    page.getByRole("heading", { name: "Safe Spot Finder 3D", exact: true }),
  ).toHaveCount(1);
  const spot = page.getByRole("button", { name: "Desk", exact: true });
  await spot.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Safety score", { exact: true })).toHaveText(
    "100",
  );
  await page.getByRole("link", { name: "← All games", exact: true }).click();
  await expect(page).toHaveURL(/\/games$/);
  expect(await bodyStyle()).toEqual(before);
  await expect(
    page.getByRole("heading", { name: "Safe Spot Finder 3D", exact: true }),
  ).toHaveCount(0);
});
