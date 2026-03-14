import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import type { StorybookConfig } from "@storybook/html-vite";
import solid from "vite-plugin-solid";

/**
 * This function is used to resolve the absolute path of a package.
 * It is necessary in projects that use Yarn PnP or are set up within a monorepo.
 */
const require = createRequire(import.meta.url);

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/html-vite"),
    options: {},
  },
  async viteFinal(baseConfig) {
    return {
      ...baseConfig,
      plugins: [...(baseConfig.plugins ?? []), solid()],
    };
  },
};
export default config;
