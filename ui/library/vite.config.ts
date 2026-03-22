import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    solid({
      include: ["src/**/*.tsx"],
      exclude: ["**/.storybook/components/**"],
    }),
  ],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./src"),
    },
  },
});
