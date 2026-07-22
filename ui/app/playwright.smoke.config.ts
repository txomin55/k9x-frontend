import os from "node:os";
import path from "node:path";
import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";
import { SMOKE_STATE_PATH } from "./smoke/utils/constants";

const baseURL = process.env.PWA_PRO_URL ?? "http://localhost:5173";
const isLocal = baseURL.includes("localhost") || baseURL.includes("127.0.0.1");

const localWebServer: PlaywrightTestConfig["webServer"] = {
  command: "pnpm run start:integrated",
  url: baseURL,
  reuseExistingServer: true,
  timeout: 120_000,
};

export default defineConfig({
  testDir: "./smoke",
  testMatch: "**/*.smoke.spec.ts",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  retries: 1,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list", { printSteps: true }],
    ["junit", { outputFile: ".reports/test/smoke/junit.xml" }],
    ["html", { outputFolder: ".reports/test/smoke/html", open: "never" }],
  ],
  outputDir: path.join(os.tmpdir(), "k9x-smoke-artifacts"),
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: isLocal ? localWebServer : undefined,
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices["Pixel 5"],
        headless: !!process.env.CI,
        launchOptions: {
          args: ["--disable-blink-features=AutomationControlled"],
        },
      },
    },
    {
      name: "smoke",
      testMatch: "**/*.smoke.spec.ts",
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        headless: !!process.env.CI,
        storageState: SMOKE_STATE_PATH,
      },
    },
  ],
});
