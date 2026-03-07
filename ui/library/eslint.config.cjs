// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
const defaultConfig = require("my-vitest/eslint.config.cjs");

module.exports = [
  ...defaultConfig,
  ...storybook.configs["flat/recommended"],
];
