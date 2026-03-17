import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
const vitestSonarReporterPath = require.resolve("vitest-sonar-reporter");
const sonarPathPrefix = path
  .relative(path.resolve(process.cwd(), "../.."), process.cwd())
  .replaceAll("\\", "/");

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    clearMocks: true,
    coverage: {
      all: true,
      exclude: [
        "**/src/**/*.constants.ts",
        "**/src/**/*.json",
        "**/src/**/*.stories.@(ts|tsx|svelte)",
      ],
      allowExternal: true,
      include: ["**/src/**/*.{ts,tsx,svelte}"],
      reportsDirectory: ".reports/test/unit/coverage",
      reporter: ["text-summary", "cobertura", "lcov", "json"],
    },
    include: ["**/src/**/*.test.{ts,tsx,svelte}"],
    reporters: [
      "default",
      "junit",
      [
        vitestSonarReporterPath,
        {
          outputFile: ".reports/sonar/unit/test-report.xml",
          silent: true,
          onWritePath(filePath: string) {
            return `${sonarPathPrefix}/${filePath}`;
          },
        },
      ],
    ],
    outputFile: {
      junit: ".reports/test/unit/junit.xml",
    },
    watch: false,
    setupFiles: ["./vitest-setup.ts"],
    deps: {
      registerNodeLoader: false,
    },
  },
} as any);
