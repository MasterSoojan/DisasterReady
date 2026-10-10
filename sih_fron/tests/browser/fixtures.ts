import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ isolatedNetwork: void }>({
  isolatedNetwork: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.routeWebSocket("**/*", (socket) => socket.close());
      await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.origin === "http://127.0.0.1:4181") return route.continue();
        if (url.pathname.endsWith("cloud.png"))
          return route.fulfill({
            contentType: "image/png",
            body: Buffer.from(
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXF8AAAAASUVORK5CYII=",
              "base64",
            ),
          });
        return route.abort();
      });
      await use();
      expect(errors, "No uncaught browser errors").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
