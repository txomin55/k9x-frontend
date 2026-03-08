import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    clearMocks: true,
    coverage: {
      all: true,
      exclude: [
        "**/src/**/*.constants.js",
        "**/src/**/*.json",
        "**/src/**/*stories.@(js|jsx|ts|tsx|svelte)",
      ],
      allowExternal: true,
      include: ["**/src/**/*.{js,jsx,ts,tsx,svelte}"],
      reportsDirectory: ".reports/test/unit/coverage",
      reporter: ["text-summary", "cobertura", "lcov", "json"],
    },
    include: ["**/src/**/*.test.{js,jsx,ts,tsx,svelte}"],
    reporters: ["default", "junit", "vitest-sonar-reporter"],
    sonarReporterOptions: { silent: true }, //??
    outputFile: {
      junit: ".reports/test/unit/junit.xml",
      "vitest-sonar-reporter": ".reports/sonar/unit/test-report.xml",
    },
    watch: false,
    setupFiles: ["./vitest-setup.js"],
    deps: {
      registerNodeLoader: false,
    },
  },
});
