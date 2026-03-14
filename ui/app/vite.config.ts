import { defineConfig, loadEnv } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import eslint from "vite-plugin-eslint";
import path from "node:path";
import commonjs from "vite-plugin-commonjs";
import { fileURLToPath } from "node:url";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const envOptions = loadEnv(mode, __dirname);
  const basePath = envOptions.VITE_APP_BASE_PATH || "";
  const assetBase = basePath ? `${basePath}/` : "/";

  return {
    base: assetBase,
    plugins: [
      solidStart({ ssr: false }),
      nitro({
        preset: "github-pages",
        prerender: {
          routes: ["/", "/home", "/auth/callback", "/404.html"],
          crawlLinks: false,
        },
      }),
      eslint({ include: "src/**/*.+(ts|tsx)" }),
      commonjs(),
      //JUST FOR DEV
      viteStaticCopy({
        targets: [
          {
            src:
              path.resolve(__dirname, "../library/src/assets/svg") + "/[!.]*",
            dest: "./",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@lib": path.resolve(__dirname, "../library/src"),
        "@test": path.resolve(__dirname, "./playwright"),
      },
    },
    server: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true,
    },
    publicDir: "static",
    build: {
      rollupOptions: {
        external: [
          "*jest*",
          "tests",
          "*.test.*",
          "cypress*",
          "coverage*",
          ".eslint*",
        ],
      },
    },
  };
});
