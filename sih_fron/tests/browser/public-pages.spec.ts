import { test, expect } from "./fixtures";
import { homeFeatures } from "../../src/features/home/content";
import { games } from "../../src/features/games/menu/data";
import { helpTopics, emergencyResource } from "../../src/features/help/content";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("home describes actual features, has working entry links and does not fetch remote icon art", async ({
  page,
}) => {
  const iconRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("flaticon")) iconRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Learn Safety in a Fun Way! 🌈",
  );
  await expect(
    page.getByText(/not an emergency response service or certified/),
  ).toBeVisible();
  for (const feature of homeFeatures)
    await expect(
      page.getByRole("link", {
        name: feature.title + " " + feature.description,
        exact: true,
      }),
    ).toHaveAttribute("href", feature.href);
  await expect(page.locator("main")).not.toContainText(
    /5,000|87%|120|92%|Schools Onboarded|Students Trained|Our team is standing by/,
  );
  await page
    .getByRole("link", { name: "Explore lessons", exact: true })
    .click();
  await expect(page).toHaveURL(/\/modules$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Browse games", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "ARCADE ZONE", exact: true }),
  ).toBeVisible();
  for (const game of games)
    await expect(
      page.getByRole("link", { name: "Play " + game.title, exact: true }),
    ).toHaveAttribute("href", game.href);
  expect(iconRequests).toEqual([]);
});

test("help exposes region-scoped official resources and keyboard FAQs without a fake feedback channel", async ({
  page,
}) => {
  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "Help & resources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Call 112 in India", exact: true }),
  ).toHaveAttribute("href", "tel:112");
  await expect(
    page.getByRole("link", { name: /Official ERSS information/ }),
  ).toHaveAttribute("href", emergencyResource.source);
  await expect(page.getByText(/Outside India/)).toBeVisible();
  await expect(page.locator('a[href="/feedback"]')).toHaveCount(0);
  for (const topic of helpTopics) {
    const summary = page.locator("summary").filter({ hasText: topic.question });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(topic.answer, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: topic.label, exact: true }),
    ).toHaveAttribute("href", topic.href);
  }
  await page.getByRole("link", { name: "Back Home", exact: true }).click();
  await expect(page).toHaveURL("/");
  // No tel: link is activated; this suite must never place an emergency call.
});

test("home/help/games/chat keep navigation, themes and page width usable at 375px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/", "/help", "/games", "/chat"]) {
    await page.goto(path);
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByText("Menu", { exact: true }).click();
    for (const label of [
      "Modules",
      "Drills",
      "Games",
      "Chat",
      "Help",
      "Account",
      "Leaderboard",
    ])
      await expect(
        navigation
          .getByRole("link", { name: label, exact: true })
          .filter({ visible: true }),
      ).toBeVisible();
    const theme = navigation.getByRole("button", {
      name: "Toggle color theme",
    });
    const before = await theme.getAttribute("aria-pressed");
    await theme.click();
    await expect(theme).toHaveAttribute(
      "aria-pressed",
      before === "true" ? "false" : "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(0);
    if (path !== "/")
      await expect(
        navigation
          .getByRole("link", {
            name: path[1].toUpperCase() + path.slice(2),
            exact: true,
          })
          .filter({ visible: true }),
      ).toHaveAttribute("aria-current", "page");
  }
  await page.screenshot({
    path: "/tmp/disaster-chat-mobile.png",
    fullPage: true,
  });
  await page.goto("/");
  await page.screenshot({
    path: "/tmp/disaster-home-mobile.png",
    fullPage: true,
  });
});

test("all public pages remain usable when WebGL is unavailable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...rest] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  for (const path of ["/", "/help", "/games", "/chat"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  await page
    .getByLabel("Your study message", { exact: true })
    .fill("Synthetic practice question");
  await page.getByRole("button", { name: "Send study message" }).click();
  await expect(
    page.getByRole("log", { name: "Study conversation" }),
  ).toContainText("Demo only: no message was sent.");
});

test("normal-motion public scenes retain their decoration while keyboard controls work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "src",
    )!;
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      ...descriptor,
      set(this: HTMLImageElement, value: string) {
        if (value.startsWith("data:image/png;base64,"))
          document.documentElement.dataset.inlineTextureRequested = "yes";
        descriptor.set!.call(this, value);
      },
    });
  });
  for (const path of ["/", "/help", "/games", "/chat"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect
      .poll(() =>
        page
          .locator("canvas")
          .evaluate(
            (node: HTMLCanvasElement) => node.width > 0 && node.height > 0,
          ),
      )
      .toBe(true);
    if (path === "/" || path === "/chat")
      await expect(page.locator("html")).toHaveAttribute(
        "data-inline-texture-requested",
        "yes",
      );
  }
  await page
    .getByLabel("Your study message", { exact: true })
    .fill("Demo question");
  await page.getByLabel("Your study message", { exact: true }).press("Enter");
  await expect(page.getByRole("log")).toContainText("Demo only:");
  await page.getByRole("link", { name: "Back Home", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Learn Safety in a Fun Way! 🌈",
  );
});

test("demo chat is explicit, keyboard-accessible, text-only and sends no backend request", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") posts++;
  });
  await page.goto("/chat");
  await expect(
    page.getByText("Demo — backend not connected", { exact: true }),
  ).toBeVisible();
  const input = page.getByLabel("Your study message", { exact: true });
  const send = page.getByRole("button", { name: "Send study message" });
  await expect(send).toBeDisabled();
  await input.fill(" ");
  await expect(send).toBeDisabled();
  await input.fill("<img src=x onerror=alert(1)>");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.getByRole("log").locator("img")).toHaveCount(0);
  await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(3);
  await expect(input).toHaveValue("");
  await expect(input).toHaveAttribute("maxlength", "4000");
  await page.reload();
  await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(1);
  expect(posts).toBe(0);
});

test("failed cloud and character textures cannot remove public controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let cloudFailed = false;
  let characterFailed = false;
  await page.route("**/cloud.png", (route) => {
    cloudFailed = true;
    return route.abort();
  });
  await page.route("**/robot-girl.png", (route) => {
    characterFailed = true;
    return route.fulfill({ status: 404, body: "Missing test texture" });
  });
  await page.goto("/");
  await expect.poll(() => cloudFailed).toBe(true);
  await expect(
    page.getByRole("link", { name: "Explore lessons", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Chat", exact: true })
    .filter({ visible: true })
    .click();
  await expect.poll(() => characterFailed).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Study Buddy", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Your study message", { exact: true })
    .fill("Still usable");
  await page.getByRole("button", { name: "Send study message" }).click();
  await expect(page.getByRole("log")).toContainText("Demo only:");
});

test("Fire Escape choices remain playable when the decorative WebGL context is unavailable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...rest] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/games/FireEscape");
  for (const choice of [
    "Check door for heat",
    "Keep closed & seal",
    "Signal from window",
  ])
    await page.getByRole("button", { name: choice, exact: false }).click();
  await expect(
    page.getByRole("heading", { name: /YOU SURVIVED/ }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: /Play Again/ }).click();
  await expect(
    page.getByRole("button", { name: /Check door for heat/ }),
  ).toBeVisible();
});
