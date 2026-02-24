import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import path from "path";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import EnvironmentPlugin from "vite-plugin-environment";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";
import commonjs from "vite-plugin-commonjs";
import jsconfigPaths from "vite-jsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default ({ mode }) => {
  const envOptions = loadEnv(mode, process.cwd());

  const viteConfig = defineConfig({
    plugins: [
      react(),
      eslint({ include: "src/**/*.+(js|jsx)" }),
      EnvironmentPlugin("all"),
      commonjs(),
      jsconfigPaths({ root: "." }),
      viteStaticCopy({
        targets: [
          {
            src:
              path.resolve(__dirname, "../library/src/assets/svg") +
              "/[!.]*",
            dest: "./",
          },
        ],
      }),
    ],
    define: {
      "process.env": {
        ...process.env,
        ...envOptions,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@lib": path.resolve(__dirname, "../library/src"),
        stream: "rollup-plugin-node-polyfills/polyfills/stream",
        http: "rollup-plugin-node-polyfills/polyfills/http",
        https: "rollup-plugin-node-polyfills/polyfills/http",
        zlib: "rollup-plugin-node-polyfills/polyfills/zlib",
        buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
        process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      },
    },
    base: envOptions.VITE_APP_BASE_PATH,
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
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectRegister: "script",
      base: `${envOptions.VITE_APP_BASE_PATH}/`,
      devOptions: {
        enabled: mode !== "production",
        navigateFallback: "index.html",
        type: "module",
      },
      manifest: {
        name: "My Awesome React App",
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
