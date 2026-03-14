import type { ReporterDescription } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PWA_PRO_URL ?? "http://127.0.0.1:3000";
const ciReporters: ReporterDescription[] = process.env.CI
  ? [["./playwright/utils/errorExitReporter.ts"]]
  : [];

export default defineConfig({
  testDir: "./src/",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list", { printSteps: true }],
    ["junit", { outputFile: ".reports/test/e2e/junit.xml" }],
    [
      "@bdellegrazie/playwright-sonar-reporter",
      { outputFile: ".reports/sonar/e2e/sonar.xml", sonarcloud: true },
    ],
    ...ciReporters,
  ],
  outputDir: ".reports/test/e2e/playwright",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.CI
      ? "pnpm run start:offline:prepared"
      : "pnpm run start:offline",
    url: baseURL,
  },
  globalSetup: "./playwright/global-setup.ts",
  globalTeardown: "./playwright/global-teardown.ts",
  projects: [
    {
      name: "Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
