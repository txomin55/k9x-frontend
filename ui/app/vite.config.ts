import { defineConfig, loadEnv } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import eslint from "vite-plugin-eslint";
import path from "node:path";
import commonjs from "vite-plugin-commonjs";
import { fileURLToPath } from "node:url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { AppRoutePath } from "./src/components/app-shell/paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const envOptions = loadEnv(mode, __dirname);
  const basePath = envOptions.VITE_APP_BASE_PATH || "";
  const assetBase = basePath ? `${basePath}/` : "/";

  return {
    base: assetBase,
    plugins: [
      tanstackRouter({
        target: "solid",
        autoCodeSplitting: true,
        routeFileIgnorePattern: "\\.(spec|test)\\.(ts|tsx)$",
      }),
      solidStart({ ssr: false }),
      nitro({
        preset: "github-pages",
        prerender: {
          routes: [
            AppRoutePath.HOME,
            AppRoutePath.MY_COMPETITIONS,
            AppRoutePath.AUTH_CALLBACK,
            AppRoutePath.NOT_FOUND,
          ],
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
