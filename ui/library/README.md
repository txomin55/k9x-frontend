# library

React component library for Dog Trainer. Built with Vite, documented in Storybook, and validated with Vitest/Chromatic.

## Tech stack and scripts

- React + Vite (`vite.config.js` uses `@vitejs/plugin-react`).
- Storybook 10 with React/Vite preset (`npm run storybook` on port 6006, `npm run build-storybook` to generate static).
- Chromatic for visual testing (`npm run chromatic` uses the token configured in the repo).
- Vitest + Testing Library (`npm run test:unit`, `npm run test:unit:coverage`).
- ESLint with React and Storybook rules.

Install dependencies with `pnpm install` (lockfile present) or `npm install` and use the scripts above for day-to-day development.

## Structure

- `src/components/atoms`: basic components. Example: `CoreButton` (`@headlessui/react` + local CSS), `CoreSvgIcon`.
- `src/components/molecules`: compositions of atoms. Example: `AnimalIcon` that renders SVGs from `src/assets/svg/animals`.
- `src/assets/styles`: global styles and color variables.
- `src/assets/svg/animals`: SVG sprites referenced by `AnimalIcon` and `animals.constants.js`.

`AnimalIcon` expects `VITE_APP_BASE_PATH` to resolve the animals folder; adjust that variable if you serve assets from a different base path.

## Component conventions

- Functional React components, with CSS co-located in each folder.
- Organization by level (atoms, molecules); each folder groups JSX, styles, tests, and stories needed for the component to work in isolation.

## Storybook

[Storybook](https://storybook.js.org/) is used to build and document the components.

- Run `npm run storybook` for the interactive environment and `npm run build-storybook` to generate static output.
- Stories define controls/args and document props/events; use comments and the Storybook API to expose this info.
- **Dark mode**: `preview.js` loads `withDarkTheme.decorator.js` to apply the theme class to all elements.
- **Sidebar badges**: use `renderLabel` in `manager.js` to show badges based on each story's `tags` (for example `figma:v1`).
- **Figma**: with `@chromatic-com/storybook` you can link designs via `parameters.design` (`type` + `url`). If private features are used, define `STORYBOOK_FIGMA_ACCESS_TOKEN`.

## Chromatic

[Chromatic](https://www.chromatic.com/) generates visual snapshots for each story and publishes the library:

- Run `npm run chromatic` to upload the build.
- Useful URLs:
  - Library: https://www.chromatic.com/library?appId=664da716aa9828a2c671d8b6&branch=master
  - Component: https://www.chromatic.com/component?appId=664da716aa9828a2c671d8b6&csfId=atoms-corebutton&branch=master

## Tests

- Unit: `npm run test:unit`.
- Coverage: `npm run test:unit:coverage`.
