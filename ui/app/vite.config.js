import { defineConfig, loadEnv } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import eslint from "vite-plugin-eslint";
import path from "node:path";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import EnvironmentPlugin from "vite-plugin-environment";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";
import commonjs from "vite-plugin-commonjs";
import jsconfigPaths from "vite-jsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default ({ mode }) => {
  const envOptions = loadEnv(mode, __dirname);
  const basePath = envOptions.VITE_APP_BASE_PATH || "";

  const viteConfig = defineConfig({
    plugins: [
      sveltekit(),
      eslint({ include: "src/**/*.+(js|svelte)" }),
      EnvironmentPlugin("all"),
      commonjs(),
      jsconfigPaths({ root: "." }),
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
        stream: "rollup-plugin-node-polyfills/polyfills/stream",
        http: "rollup-plugin-node-polyfills/polyfills/http",
        https: "rollup-plugin-node-polyfills/polyfills/http",
        zlib: "rollup-plugin-node-polyfills/polyfills/zlib",
        buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
        process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      },
    },
    server: {
      port: 3000,
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
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
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          rollupNodePolyFill({
            include: ["node_modules/**/*.js", "src/**/*.js", "*.js"],
          }),
        ],
      },
    },
  });

  viteConfig.plugins.push(
    SvelteKitPWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js",
      injectManifest: {
        // Only precache client assets; avoid the prerendered glob warning.con
        globPatterns: ["client/**/*.{js,css,ico,png,svg,webp,webmanifest}"],
        globIgnores: ["server/**"],
        // Prevent @vite-pwa/sveltekit from auto-adding prerendered glob patterns.
        modifyURLPrefix: {},
      },
      injectRegister: "script",
      devOptions: {
        enabled: ["offline", "integrated"].includes(mode),
        // SvelteKit doesn't serve /index.html in dev; fallback to the app root.
        navigateFallback: basePath ? `${basePath}/` : "/",
        type: "module",
      },
      base: basePath ? `${basePath}/` : "/",
      manifest: {
        name: "My Awesome Svelte App",
        short_name: "MyApp",
        description: "My Awesome App description",
        theme_color: "#ffffff",
        id: `${envOptions.VITE_APP_BASE_PATH}/`,
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  );

  return viteConfig;
};
