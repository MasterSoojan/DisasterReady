import type { Page, Route } from "@playwright/test";
import { test, expect } from "./fixtures";

const endpoint = "**/mock-api/chat";
const input = (page: Page) =>
  page.getByLabel("Your study message", { exact: true });
const send = (page: Page) =>
  page.getByRole("button", { name: "Send study message" });
const chat = (page: Page) =>
  page.getByRole("region", { name: "Study Buddy", exact: true });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = window.fetch;
    window.fetch = function (resource, options) {
      if (String(resource).includes("/mock-api/chat"))
        options?.signal?.addEventListener(
          "abort",
          () => {
            document.documentElement.dataset.chatAborted = "yes";
          },
          { once: true },
        );
      return original.call(this, resource, options);
    };
  });
});

test("configured chat discloses persistence and renders only checked text replies", async ({
  page,
}) => {
  const requests: unknown[] = [];
  await page.route(endpoint, (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    return route.fulfill({
      json: {
        user_message: body.message,
        bot_response: "<img src=x onerror=alert(1)> A synthetic reply.",
      },
    });
  });
  await page.goto("/chat");
  await expect(
    page.getByText("Configured backend — rule-based replies", { exact: true }),
  ).toBeVisible();
  await expect(chat(page)).toContainText("stores it in its database");
  await input(page).fill("  Synthetic study question  ");
  await input(page).press("Enter");
  await expect(page.getByRole("log")).toContainText(
    "<img src=x onerror=alert(1)> A synthetic reply.",
  );
  await expect(page.getByRole("log").locator("img")).toHaveCount(0);
  await expect(input(page)).toHaveValue("");
  expect(requests).toEqual([{ message: "Synthetic study question" }]);
});

test("malformed, wrong-message, HTTP and network failures preserve drafts without fake replies or retries", async ({
  page,
}) => {
  let calls = 0;
  const replies = ["malformed", "wrong-message", "http-error", "network-error"];
  await page.route(endpoint, (route) => {
    const mode = replies[calls++];
    if (mode === "network-error") return route.abort("failed");
    if (mode === "http-error")
      return route.fulfill({ status: 503, body: "private diagnostics" });
    if (mode === "malformed")
      return route.fulfill({
        body: "{broken",
        contentType: "application/json",
      });
    return route.fulfill({
      json: { user_message: "Different request", bot_response: "not ours" },
    });
  });
  await page.goto("/chat");
  for (const [index, mode] of replies.entries()) {
    await input(page).fill("Draft " + mode);
    await send(page).click();
    await expect(chat(page).getByRole("alert")).toBeVisible();
    await expect(input(page)).toHaveValue("Draft " + mode);
    await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(1);
    await expect(chat(page).getByRole("alert")).not.toContainText(
      "private diagnostics",
    );
    await expect(chat(page).getByRole("alert")).toContainText(
      "may already be stored",
    );
    expect(calls).toBe(index + 1);
  }
});

test("in-flight requests are locked, cancel preserves the draft and a late reply is ignored", async ({
  page,
}) => {
  let held: Route | undefined;
  let calls = 0;
  await page.route(endpoint, (route) => {
    calls++;
    held = route;
  });
  await page.goto("/chat");
  await input(page).fill("Keep my draft");
  await send(page).click();
  await expect(chat(page).getByRole("status")).toHaveText(
    "Waiting for a reply…",
  );
  await expect(send(page)).toBeDisabled();
  await expect(input(page)).toHaveAttribute("readonly", "");
  await input(page).press("Enter");
  await expect.poll(() => calls).toBe(1);
  await chat(page).getByRole("button", { name: "Cancel waiting" }).click();
  await expect(chat(page).getByRole("alert")).toContainText(
    "Waiting cancelled",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-chat-aborted",
    "yes",
  );
  await expect(input(page)).toHaveValue("Keep my draft");
  await held!
    .fulfill({
      json: { user_message: "Keep my draft", bot_response: "Late reply" },
    })
    .catch(() => {});
  await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(1);
  await expect(send(page)).toBeEnabled();
});

test("ten-second timeout aborts waiting, retains the draft and does not invent successful delivery", async ({
  page,
}) => {
  let held: Route | undefined;
  await page.route(endpoint, (route) => {
    held = route;
  });
  await page.goto("/chat");
  await page.clock.install();
  await input(page).fill("Stalled synthetic message");
  await send(page).click();
  await expect(chat(page).getByRole("status")).toBeVisible();
  await expect.poll(() => !!held).toBe(true);
  await page.clock.runFor(10001);
  await expect(chat(page).getByRole("alert")).toContainText("took too long");
  await expect(page.locator("html")).toHaveAttribute(
    "data-chat-aborted",
    "yes",
  );
  await expect(input(page)).toHaveValue("Stalled synthetic message");
  await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(1);
  await held!
    .fulfill({
      json: { user_message: "Stalled synthetic message", bot_response: "Late" },
    })
    .catch(() => {});
});

test("client-side navigation aborts pending transport and late replies cannot enter a fresh conversation", async ({
  page,
}) => {
  let held: Route | undefined;
  await page.route(endpoint, (route) => {
    held = route;
  });
  await page.goto("/chat");
  await input(page).fill("Leaving this screen");
  await send(page).click();
  await expect.poll(() => !!held).toBe(true);
  await page.getByRole("link", { name: "Back Home", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-chat-aborted",
    "yes",
  );
  await held!
    .fulfill({
      json: { user_message: "Leaving this screen", bot_response: "Late reply" },
    })
    .catch(() => {});
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Chat", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(1);
  await expect(input(page)).toHaveValue("");
});
