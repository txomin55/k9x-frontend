import path from "node:path";
import baseConfig from "my-vitest/vitest.config.js";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [svelte()],
  ...baseConfig,
  resolve: {
    // Ensure client-side Svelte exports are used during tests.
    conditions: ["browser"],
  },
  test: {
    ...baseConfig.test,
    alias: {
      "@lib": path.resolve(__dirname, "./src"),
    },
    deps: {
      ...baseConfig.test?.deps,
      registerNodeLoader: true,
    },
  },
};
