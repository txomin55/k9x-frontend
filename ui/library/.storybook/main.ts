import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import solid from "vite-plugin-solid";
import remarkGfm from "remark-gfm";

/**
 * This function is used to resolve the absolute path of a package.
 * It is necessary in projects that use Yarn PnP or are set up within a monorepo.
 */
const nodeRequire = createRequire(join(process.cwd(), "package.json"));
const kobalteSolidDist = /node_modules\/(?:\.pnpm\/.*\/)?@kobalte\/core\/dist\/.*\.jsx$/;

function getAbsolutePath(value) {
  return dirname(nodeRequire.resolve(join(value, "package.json")));
}

function mergeResolveConditions(
  conditions: string[] | undefined,
): string[] {
  return Array.from(new Set(["solid", ...(conditions ?? [])]));
}

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("storybook-addon-tag-badges"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/html-vite"),
    options: {},
  },
  async viteFinal(baseConfig) {
    return {
      ...baseConfig,
      plugins: [
        ...(baseConfig.plugins ?? []),
        solid({
          include: ["src/**/*.tsx", kobalteSolidDist],
          exclude: ["**/.storybook/components/**"],
        }),
      ],
      resolve: {
        ...(baseConfig.resolve ?? {}),
        conditions: mergeResolveConditions(baseConfig.resolve?.conditions),
      },
    };
  },
};
export default config;
