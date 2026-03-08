import path from "node:path";
import baseConfig from "my-vitest/vitest.config.js";
import { fileURLToPath } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trim or override parts of the shared config that don't apply here (e.g. Solid
// workarounds), and re-align env/watch defaults for React.
const { test: baseTest = {}, ...restBaseConfig } = baseConfig;
const { transformMode, ...restBaseTest } = baseTest;

export default {
  plugins: [sveltekit()],
  ...restBaseConfig,
  resolve: {
    // Ensure client-side Svelte exports are used during tests.
    conditions: ["browser"],
  },
  test: {
    ...restBaseTest,
    // Use jsdom for Svelte component tests and allow watch locally.
    environment: "jsdom",
    watch: process.env.CI ? false : undefined,
    deps: {
      ...restBaseTest.deps,
      inline: [/^@lib\//, /\/ui\/library\/src\//],
      registerNodeLoader: true,
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "../library/src"),
    },
    coverage: {
      ...restBaseTest.coverage,
      provider: "v8",
      // Only report executed files to avoid v8 remap failures on raw .svelte.
      all: false,
      include: [
        path.resolve(__dirname, "src/**/*.{js,svelte}"),
        path.resolve(__dirname, "../library/src/**/*.{js,svelte}"),
      ],
    },
  },
};
