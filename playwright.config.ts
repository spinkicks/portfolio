import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:8422",
    channel: "chrome",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 8422",
    url: "http://127.0.0.1:8422",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
