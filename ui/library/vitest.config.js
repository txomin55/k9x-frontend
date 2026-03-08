import path from "node:path";
import baseConfig from "my-vitest/vitest.config.js";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { test: baseTest = {}, ...restBaseConfig } = baseConfig;
const { transformMode, ...restBaseTest } = baseTest;

export default {
  plugins: [svelte()],
  ...restBaseConfig,
  resolve: {
    // Ensure client-side Svelte exports are used during tests.
    conditions: ["browser"],
  },
  test: {
    ...restBaseTest,
    coverage: {
      ...restBaseConfig.coverage,
      extension: [".js", ".jsx", ".ts", ".tsx", ".svelte"],
      reporter: ["text-summary"],
      include: [path.resolve(__dirname, "src/**/*.{js,svelte}")],
    },
    alias: {
      "@lib": path.resolve(__dirname, "./src"),
    },
    deps: {
      ...restBaseConfig.deps,
      registerNodeLoader: true,
    },
  },
};
