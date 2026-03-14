# My Vitest preset

Vitest configuration for React projects. Ships with jsdom environment, common reporters, and sensible coverage defaults.

## What it does

- Uses `vitest.config.js` with `@vitejs/plugin-react`
- Globals enabled and `jsdom` environment for browser-like tests
- Collects coverage from `src/**/*.{js,jsx}`, excluding `**/*.constants.js`, JSON files, and Storybook stories
- Reporters: default, JUnit, and Sonar (`vitest-sonar-reporter`), with outputs in `.reports/test/unit/`
- Coverage reports: text-summary, cobertura, lcov, and json under `.reports/test/unit/coverage`
- Test include pattern: `**/src/**/*.test.{js,jsx}`
- Setup file `vitest-setup.js` loads `@testing-library/jest-dom` assertions
