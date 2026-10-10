import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import {
  DEMO_ACCOUNT_KEY,
  type DemoUser,
} from "../../src/features/accounts/demoUsers";

const student: DemoUser = {
  username: "Student fixture",
  password: "demo-only",
  role: "student",
};
const teacher: DemoUser = {
  username: "Teacher fixture",
  password: "demo-only",
  role: "teacher",
};
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXF8AAAAASUVORK5CYII=";
const avatar = {
  name: "avatar.png",
  mimeType: "image/png",
  buffer: Buffer.from(png, "base64"),
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function legacy(
  page: Page,
  users = [student, teacher],
  selected: DemoUser | null = student,
) {
  await page.addInitScript(
    ({ users, selected }) => {
      // Keep original keys present on reload: the versioned store must take precedence.
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(selected));
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminName", "admin");
    },
    { users, selected },
  );
}
async function state(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    DEMO_ACCOUNT_KEY,
  );
}
async function signIn(page: Page, user = student) {
  await page.getByLabel("Username", { exact: true }).fill(user.username);
  await page.getByLabel("Demo password").fill(user.password!);
  await page.getByRole("button", { name: "Open demo", exact: true }).click();
}
const editor = (page: Page) =>
  page.getByRole("dialog", { name: "Edit demo profile" });
const profile = (page: Page) =>
  page.getByRole("region", { name: "Demo profile", exact: true });
async function blockSaves(page: Page) {
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Test quota", "QuotaExceededError");
      original.call(this, name, value);
    };
  }, DEMO_ACCOUNT_KEY);
}

test("new demo signup supports keyboard entry, honest empty stats and persistent logout/sign-in", async ({
  page,
}) => {
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "Demo accounts", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/passwords and profile details.*plain text/),
  ).toBeVisible();
  expect(await state(page)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("users"))).toBeNull();
  await page
    .getByRole("button", { name: "Create demo account", exact: true })
    .click();
  await page.getByLabel("Username", { exact: true }).fill("  New fixture  ");
  await page.getByLabel("Demo password").fill("demo-only");
  await page.getByLabel("Demo password").press("Enter");
  await expect(
    profile(page).getByRole("heading", { name: "New fixture" }),
  ).toBeVisible();
  await expect(
    page.getByText("No achievements have been recorded for this demo account."),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Stored demo statistics" }).locator("dd"),
  ).toHaveText(["—", "—"]);
  expect((await state(page)).users).toEqual([
    { username: "New fixture", password: "demo-only", role: "student" },
  ]);
  await page.reload();
  await expect(profile(page)).toBeVisible();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  expect((await state(page)).currentUsername).toBeNull();
  await page.goto("/account/dashboard");
  await expect(page).toHaveURL(/\/account$/);
  await signIn(page, { ...student, username: "New fixture" });
  await expect(profile(page)).toBeVisible();
});

test("teacher login migrates the legacy record once, opens the leaderboard and ignores stale admin flags", async ({
  page,
}) => {
  await legacy(page, [student, teacher], null);
  await page.goto("/login");
  await signIn(page, student);
  await expect(
    page.getByRole("alert").filter({ hasText: /No matching teacher/ }),
  ).toBeVisible();
  expect(await state(page)).toBeNull();
  await signIn(page, teacher);
  await expect(
    page.getByRole("heading", { name: "Demo leaderboard", exact: true }),
  ).toBeVisible();
  expect((await state(page)).currentUsername).toBe(teacher.username);
  await expect(
    page.getByText(/No recorded quiz results to rank/),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Local demo leaderboard" })
      .getByRole("row")
      .filter({ hasText: student.username }),
  ).toContainText("Unranked");
  await page.getByRole("link", { name: "Back to profile" }).click();
  await expect(
    page.getByRole("region", { name: "Local student roster" }),
  ).toContainText(student.username);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.goto("/leaderboard");
  await expect(page).toHaveURL(/\/account$/);
  expect(await page.evaluate(() => localStorage.getItem("isAdmin"))).toBe(
    "true",
  );
  await signIn(page, student);
  await expect(profile(page)).toBeVisible();
  await page.goto("/leaderboard");
  await expect(page).toHaveURL(/\/account$/);
});

test("profile drafts cancel cleanly, then rename/email/avatar save together and survive reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await legacy(page);
  await page.goto("/account/dashboard");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page)
    .getByLabel("Username", { exact: true })
    .fill("Cancelled draft");
  await editor(page).getByLabel("Avatar image").setInputFiles(avatar);
  await expect(editor(page).getByAltText("New avatar preview")).toBeVisible();
  await expect(profile(page).getByAltText("Saved avatar")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(editor(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Edit profile", exact: true }),
  ).toBeFocused();
  expect(await state(page)).toBeNull();
  await expect(
    profile(page).getByRole("heading", { name: student.username }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await expect(
    editor(page).getByLabel("Username", { exact: true }),
  ).toHaveValue(student.username);
  await editor(page)
    .getByLabel("Username", { exact: true })
    .fill(teacher.username);
  await editor(page).getByRole("button", { name: "Save changes" }).click();
  await expect(editor(page).getByRole("alert")).toHaveText(/already exists/);
  await editor(page)
    .getByLabel("Username", { exact: true })
    .fill("Renamed fixture");
  await editor(page)
    .getByLabel("Email", { exact: true })
    .fill("demo@example.test");
  await editor(page).getByLabel("Avatar image").setInputFiles(avatar);
  await expect(editor(page).getByAltText("New avatar preview")).toBeVisible();
  expect(
    await editor(page).evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/disaster-profile-mobile.png",
    fullPage: true,
  });
  await editor(page).getByRole("button", { name: "Save changes" }).click();
  await expect(editor(page)).toHaveCount(0);
  await expect(
    profile(page).getByRole("heading", { name: "Renamed fixture" }),
  ).toBeVisible();
  await expect(profile(page)).toContainText("demo@example.test");
  expect((await state(page)).users[0].avatar).toBe(
    `data:image/png;base64,${png}`,
  );
  expect((await state(page)).currentUsername).toBe("Renamed fixture");
  await page.reload();
  const saved = profile(page).getByAltText("Saved avatar");
  await expect(saved).toBeVisible();
  await expect
    .poll(() => saved.evaluate((node: HTMLImageElement) => node.naturalWidth))
    .toBe(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await signIn(page, student);
  await expect(
    page.getByRole("alert").filter({ hasText: /No matching demo/ }),
  ).toBeVisible();
  await signIn(page, { ...student, username: "Renamed fixture" });
  await expect(profile(page)).toBeVisible();
});

test("invalid images never replace the draft; legacy remote avatars are not fetched and can be removed", async ({
  page,
}) => {
  const old = {
    ...student,
    avatar: "https://legacy-avatar.example.test/private.png",
  };
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("legacy-avatar")) requests.push(request.url());
  });
  await legacy(page, [old, teacher], old);
  await page.goto("/account/dashboard");
  await expect(profile(page)).toContainText("The legacy avatar is unavailable");
  await expect(profile(page).getByAltText("Saved avatar")).toHaveCount(0);
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  for (const [file, message] of [
    [
      {
        name: "bad.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from("<svg/>"),
      },
      /PNG, JPEG or WebP/,
    ],
    [
      {
        name: "too-large.png",
        mimeType: "image/png",
        buffer: Buffer.alloc(256 * 1024 + 1),
      },
      /256 KiB/,
    ],
    [
      {
        name: "forged.png",
        mimeType: "image/png",
        buffer: Buffer.from("not-png"),
      },
      /not a supported/,
    ],
    [
      {
        name: "truncated.png",
        mimeType: "image/png",
        buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      },
      /could not be decoded/,
    ],
  ] as const) {
    await editor(page).getByLabel("Avatar image").setInputFiles(file);
    await expect(editor(page).getByRole("alert")).toHaveText(message);
    await expect(editor(page).getByAltText("New avatar preview")).toHaveCount(
      0,
    );
  }
  await editor(page)
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  expect(await state(page)).toBeNull();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page).getByRole("button", { name: "Remove avatar" }).click();
  await editor(page).getByRole("button", { name: "Save changes" }).click();
  await expect(editor(page)).toHaveCount(0);
  expect((await state(page)).users[0].avatar).toBe("");
  expect(requests).toEqual([]);
});

test("quota failures preserve signup/login fields without creating a successful session", async ({
  page,
}) => {
  await legacy(page, [student, teacher], null);
  await page.goto("/account");
  await blockSaves(page);
  await signIn(page);
  await expect(
    page.getByRole("alert").filter({ hasText: /could not save/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Demo password")).toHaveValue("demo-only");
  expect(await state(page)).toBeNull();
  await page
    .getByRole("button", { name: "Create demo account", exact: true })
    .click();
  await page.getByLabel("Username", { exact: true }).fill("Unsaved fixture");
  await page.getByLabel("Demo password").fill("new-demo-only");
  await page.getByRole("button", { name: "Create and open demo" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /could not save/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue(
    "Unsaved fixture",
  );
  await expect(page.getByLabel("Demo password")).toHaveValue("new-demo-only");
  expect(await state(page)).toBeNull();
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem("users"))) ?? "[]",
    ),
  ).toEqual([student, teacher]);
});

test("failed profile save preserves the draft and failed logout leaves the active identity intact", async ({
  page,
}) => {
  await legacy(page);
  await page.goto("/account/dashboard");
  await blockSaves(page);
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page)
    .getByLabel("Username", { exact: true })
    .fill("Unsaved rename");
  await editor(page).getByRole("button", { name: "Save changes" }).click();
  await expect(editor(page).getByRole("alert")).toHaveText(/could not save/);
  await expect(
    editor(page).getByLabel("Username", { exact: true }),
  ).toHaveValue("Unsaved rename");
  await expect(
    profile(page).getByRole("heading", { name: student.username }),
  ).toBeVisible();
  expect(await state(page)).toBeNull();
  await editor(page)
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /could not save/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/account\/dashboard$/);
  await expect(profile(page)).toBeVisible();
});

test("malformed local data is reported rather than replaced by an empty account list", async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        '{"version":1,"users":[{"username":"broken","role":"student","badges":{}}],"currentUsername":"broken"}',
      ),
    DEMO_ACCOUNT_KEY,
  );
  await page.goto("/account/dashboard");
  await expect(
    page.getByRole("heading", { name: "Demo account unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: /not overwritten/ }),
  ).toBeVisible();
  const before = await state(page);
  await page.getByRole("link", { name: "Back to demo accounts" }).click();
  await expect(
    page.getByRole("button", { name: "Open demo", exact: true }),
  ).toBeDisabled();
  expect(await state(page)).toEqual(before);
});

test("blocked storage exposes a useful error while public navigation still works", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Test blocked", "SecurityError");
    };
  });
  await page.goto("/account/dashboard");
  await expect(
    page.getByRole("alert").filter({ hasText: /storage is unavailable/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to demo accounts" }).click();
  await expect(
    page.getByRole("button", { name: "Open demo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Back Home", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("another-tab profile changes refresh display but stale edits cannot overwrite them", async ({
  page,
  context,
}) => {
  await legacy(page);
  await page.goto("/account/dashboard");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page)
    .getByLabel("Email", { exact: true })
    .fill("stale@example.test");
  const other = await context.newPage();
  // Same-origin local response gives this page storage access without loading the app or vendors.
  await other.route("**/*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Storage fixture</title>",
    }),
  );
  await other.goto("http://127.0.0.1:4181/storage-fixture");
  await other.evaluate(
    ({ key, student, teacher }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          users: [{ ...student, email: "fresh@example.test" }, teacher],
          currentUsername: student.username,
        }),
      );
    },
    { key: DEMO_ACCOUNT_KEY, student, teacher },
  );
  await expect(profile(page)).toContainText("fresh@example.test");
  await editor(page).getByRole("button", { name: "Save changes" }).click();
  await expect(editor(page).getByRole("alert")).toHaveText(
    /changed in another view/,
  );
  await expect(editor(page).getByLabel("Email", { exact: true })).toHaveValue(
    "stale@example.test",
  );
  expect((await state(page)).users[0].email).toBe("fresh@example.test");
  await editor(page)
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await expect(editor(page).getByLabel("Email", { exact: true })).toHaveValue(
    "fresh@example.test",
  );
  await editor(page)
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await other.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(
      key,
      JSON.stringify({ ...data, currentUsername: null }),
    );
  }, DEMO_ACCOUNT_KEY);
  await expect(page).toHaveURL(/\/account$/);
  await other.close();
});

test("leaderboard ranks only recorded attempts, preserves zero scores and reacts to local updates", async ({
  page,
}) => {
  const zero = {
    ...student,
    username: "Zero fixture",
    totalQuizzes: 1,
    averageScore: 0,
  };
  const high = {
    ...student,
    username: "High fixture",
    totalQuizzes: 2,
    averageScore: 90,
    badges: ["Existing demo badge"],
  };
  await legacy(page, [teacher, student, zero, high], teacher);
  await page.goto("/leaderboard");
  const table = page.getByRole("region", { name: "Local demo leaderboard" });
  await expect(
    table.getByRole("row").filter({ hasText: high.username }),
  ).toContainText("#1");
  const zeroRow = table.getByRole("row").filter({ hasText: zero.username });
  await expect(zeroRow).toContainText("#2");
  await expect(zeroRow.getByRole("cell")).toHaveText([
    "#2",
    "1",
    "0%",
    "—",
    "—",
  ]);
  await expect(
    table.getByRole("row").filter({ hasText: student.username }),
  ).toContainText("Unranked");
  await expect(
    page.getByRole("region", { name: "Recorded top scores" }),
  ).not.toContainText(student.username);
  await page.evaluate(
    ({ key, teacher, student }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          users: [teacher, student],
          currentUsername: teacher.username,
        }),
      );
      window.dispatchEvent(new StorageEvent("storage", { key }));
      window.print = () => {
        document.documentElement.dataset.printed = "yes";
      };
    },
    { key: DEMO_ACCOUNT_KEY, teacher, student },
  );
  await expect(
    page.getByRole("region", { name: "Recorded top scores" }),
  ).toHaveCount(0);
  await expect(
    page.getByText(/No recorded quiz results to rank/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Print demo report" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "yes");
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByText(/not verified learner performance/),
  ).toBeVisible();
});

test("avatar cancellation and timeout release pending readers and never save a late result", async ({
  page,
}) => {
  await legacy(page);
  await page.addInitScript(() => {
    class PendingReader {
      static LOADING = 1;
      readyState = 1;
      result = null;
      onload = null;
      onerror = null;
      onabort = null;
      readAsDataURL() {
        document.documentElement.dataset.readerStarted = "yes";
      }
      abort() {
        document.documentElement.dataset.readerAborted = "yes";
        document.documentElement.dataset.readerDetached = String(
          this.onload === null &&
            this.onerror === null &&
            this.onabort === null,
        );
      }
    }
    window.FileReader = PendingReader as unknown as typeof FileReader;
  });
  await page.goto("/account/dashboard");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page).getByLabel("Avatar image").setInputFiles(avatar);
  await expect(editor(page).getByRole("status")).toHaveText("Checking image…");
  await expect(
    editor(page).getByRole("button", { name: "Save changes" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(editor(page)).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute(
    "data-reader-aborted",
    "yes",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-reader-detached",
    "true",
  );
  expect(await state(page)).toBeNull();
  await page.clock.install();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page).getByLabel("Avatar image").setInputFiles(avatar);
  await page.clock.runFor(10001);
  await expect(editor(page).getByRole("alert")).toHaveText(/took too long/);
  await expect(
    editor(page).getByRole("button", { name: "Save changes" }),
  ).toBeEnabled();
  await expect(editor(page).getByAltText("New avatar preview")).toHaveCount(0);
  expect(await state(page)).toBeNull();
});

test("normal-motion account scenes load without font workers and mobile navigation remains usable", async ({
  page,
}) => {
  await legacy(page, [teacher, student], teacher);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/account/dashboard");
  await expect(profile(page)).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await editor(page)
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await page.getByRole("link", { name: "Open demo leaderboard" }).click();
  await expect(
    page.getByRole("heading", { name: "Demo leaderboard", exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByText("Demo records", { exact: true })).toBeAttached();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await navigation.getByText("Menu", { exact: true }).click();
  await navigation
    .getByRole("link", { name: "Account", exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Demo accounts", exact: true }),
  ).toBeVisible();
});
