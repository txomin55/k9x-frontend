import path from "node:path";
import { defineConfig } from "vitest/config";
import baseConfig from "my-vitest/vitest.config";
import { fileURLToPath } from "node:url";
import solid from "vite-plugin-solid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { test: baseTest = {}, ...restBaseConfig } = baseConfig as any;
const { transformMode: _transformMode, ...restBaseTest } = baseTest as any;

export default defineConfig({
  plugins: [solid()],
  ...restBaseConfig,
  test: {
    ...restBaseTest,
    coverage: {
      ...restBaseTest.coverage,
      provider: "v8",
      extension: [".ts", ".tsx"],
      include: [path.resolve(__dirname, "src/**/*.{ts,tsx}")],
    },
    alias: {
      "@lib": path.resolve(__dirname, "./src"),
    },
    deps: {
      ...restBaseTest.deps,
      registerNodeLoader: true,
    },
  },
} as any);
