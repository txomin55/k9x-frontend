import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import jsconfigPaths from "vite-jsconfig-paths";
import { createWebManifest } from "./src/manifest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    plugins: [
      jsconfigPaths({ root: "." }),
      {
        name: "k9x-webmanifest",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "manifest.webmanifest",
            source: JSON.stringify(
              createWebManifest(env.VITE_APP_BASE_PATH),
              null,
              2,
            ),
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@lib": path.resolve(__dirname, "../library/src"),
      },
    },
    build: {
      emptyOutDir: false,
      minify: mode === "production",
      outDir: path.resolve(__dirname, "./static"),
      sourcemap: false,
      lib: {
        entry: path.resolve(__dirname, "./src/sw.ts"),
        fileName: () => "sw.js",
        formats: ["iife"],
        name: "K9xServiceWorker",
      },
      rollupOptions: {
        output: {
          extend: true,
          inlineDynamicImports: true,
        },
      },
    },
  };
});
