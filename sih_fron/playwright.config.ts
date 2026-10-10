import { defineConfig } from "@playwright/test";

// A separate production build exercises configured chat without any live backend.
const connectedChat = process.env.DISASTER_TEST_CONNECTED_CHAT === "1";
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: connectedChat ? "**/chat-connected.spec.ts" : "**/*.spec.ts",
  testIgnore: connectedChat ? [] : ["**/chat-connected.spec.ts"],
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:4181",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run build && npm start -- --hostname 127.0.0.1 --port 4181",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: connectedChat
        ? "http://127.0.0.1:4181/mock-api"
        : "",
    },
  },
});
