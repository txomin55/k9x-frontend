import path from "path";
import baseConfig from "my-vitest/vitest.config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trim or override parts of the shared config that don't apply here (e.g. Solid
// workarounds), and re-align env/watch defaults for React.
const { test: baseTest = {}, ...restBaseConfig } = baseConfig;
const { transformMode, ...restBaseTest } = baseTest;

export default {
  ...restBaseConfig,
  test: {
    ...restBaseTest,
    // Use jsdom for broader React compatibility and allow watch locally.
    environment: "jsdom",
    watch: process.env.CI ? false : undefined,
    deps: {
      ...restBaseTest.deps,
      registerNodeLoader: true,
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "../library/src"),
    },
  },
};
