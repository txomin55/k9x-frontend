const vitest = require("@vitest/eslint-plugin");
const vitestGlobalsPlugin = require("eslint-plugin-vitest-globals");
const defaultConfig = require("my-eslint/eslint.config.cjs");

const vitestGlobals = {
  ...vitest.environments.env.globals,
  ...vitestGlobalsPlugin.environments.env.globals,
};

module.exports = [
  ...defaultConfig,
  {
    ...vitest.configs.recommended,
    files: ["**/*.test.js", "**/*.test.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: vitestGlobals,
    },
    plugins: {
      ...vitest.configs.recommended.plugins,
      "vitest-globals": vitestGlobalsPlugin,
    },
  },
];
