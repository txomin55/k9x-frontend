import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    clearMocks: true,
    coverage: {
      all: true,
      exclude: [
        "**/src/**/*.constants.js",
        "**/src/**/*.json",
        "**/src/**/*stories.jsx",
      ],
      include: ["**/src/**/*.{js,jsx}"],
      reportsDirectory: ".reports/test/unit/coverage",
      reporter: ["text-summary", "cobertura", "lcov", "json"],
    },
    include: ["**/src/**/*.test.{js,jsx}"],
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
