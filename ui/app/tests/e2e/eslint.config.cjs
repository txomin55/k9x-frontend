const cypress = require("eslint-plugin-cypress");

module.exports = [
  {
    languageOptions: {
      globals: {
        mocha: true,
        "cypress/globals": true,
      },
    },
    plugins: {
      cypress,
    },
    rules: {
      strict: "off",
    },
  },
];
