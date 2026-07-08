import path from "node:path";
import { defineConfig } from "vitest/config";
import baseConfig from "my-vitest/vitest.config";
import { fileURLToPath } from "node:url";
import solid from "vite-plugin-solid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { test: baseTest = {}, ...restBaseConfig } = baseConfig as any;
const { transformMode: _transformMode, ...restBaseTest } = baseTest as any;

export default defineConfig({
  plugins: [solid()],
  ...restBaseConfig,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "../library/src"),
    },
  },
  test: {
    ...restBaseTest,
    environment: "jsdom",
    watch: process.env.CI ? false : undefined,
    server: {
      ...restBaseTest.server,
      deps: {
        ...restBaseTest.server?.deps,
        inline: [
          /^@lib\//,
          /\/ui\/library\/src\//,
          /@kobalte\/core/,
          /^@solidjs\//,
          /^solid-js$/,
          /^solid-js\//,
          /@tanstack\/solid-router/,
          /solid-prevent-scroll/,
          /@corvu\//,
          /solid-presence/,
        ],
      },
    },
    coverage: {
      ...restBaseTest.coverage,
      all: false,
      allowExternal: true,
      provider: "v8",
      extension: [".ts", ".tsx"],
      include: [
        path.resolve(__dirname, "src/**/*.{ts,tsx}"),
      ],
    },
  },
} as any);
