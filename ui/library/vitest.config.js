import path from "path";
import baseConfig from "my-vitest/vitest.config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
