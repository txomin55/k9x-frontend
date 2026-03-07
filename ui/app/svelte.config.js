import adapter from "@sveltejs/adapter-static";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = process.env.VITE_APP_BASE_PATH ?? "";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: true,
  },
  kit: {
    // GitHub Pages needs a static build with an SPA fallback.
    adapter: adapter({
      fallback: "index.html",
    }),
    paths: {
      base: basePath,
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "../library/src"),
    },
  },
};

export default config;
