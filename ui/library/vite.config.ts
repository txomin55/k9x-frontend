import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kobalteSolidDist = /node_modules\/(?:\.pnpm\/.*\/)?@kobalte\/core\/dist\/.*\.jsx$/;

export default defineConfig({
  plugins: [
    solid({
      include: ["src/**/*.tsx", kobalteSolidDist],
      exclude: ["**/.storybook/components/**"],
    }),
  ],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./src"),
    },
    conditions: ["solid"],
  },
});
