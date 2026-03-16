# library

SolidJS component library for Dog Trainer. Built with Vite, documented in Storybook, and validated with Vitest/Chromatic.

## Tech stack and scripts

- SolidJS + Vite.
- Storybook 10 with HTML/Vite + Solid rendering helpers (`pnpm run storybook` on port 6006, `pnpm run build-storybook` to generate static).
- Chromatic for visual testing (`pnpm run chromatic`).
- Vitest + Testing Library (`pnpm run test:unit:coverage`).
- ESLint with Storybook rules.

Install dependencies with `pnpm install` at the workspace root and use the scripts above for day-to-day development.

## Structure

- `src/components/atoms`: basic components. Example: `CoreButton` and `CoreSvgIcon`.
- `src/components/molecules`: compositions of atoms. Example: `AnimalIcon` that renders SVGs from `src/assets/svg/animals`.
- `src/assets/styles`: global styles and color variables.
- `src/assets/svg/animals`: SVG sprites referenced by `AnimalIcon` and `animals.constants.ts`.

`AnimalIcon` resolves the selected animal icon from the app's `/animals` static path, so rendering only requests the
current SVG while the service worker can warm the rest in the background.

## Component conventions

- Functional Solid components, with CSS co-located in each folder.
- Organization by level (atoms, molecules); each folder groups JSX, styles, tests, and stories needed for the component to work in isolation.

## Storybook

[Storybook](https://storybook.js.org/) is used to build and document the components.

- Run `pnpm run storybook` for the interactive environment and `pnpm run build-storybook` to generate static output.
- Stories define controls/args and document props/events; use comments and the Storybook API to expose this info.
- **Dark mode**: `.storybook/preview.ts` loads `.storybook/withDarkTheme.decorator.ts` to set `data-theme` on the `html` element.
- **Sidebar badges**: use `renderLabel` in `.storybook/manager.ts` to show badges based on each story's `tags` (for example `figma:v1`).
- **Figma**: with `@chromatic-com/storybook` you can link designs via `parameters.design` (`type` + `url`). If private features are used, define `STORYBOOK_FIGMA_ACCESS_TOKEN`.

## Chromatic

[Chromatic](https://www.chromatic.com/) generates visual snapshots for each story and publishes the library:

- Run `pnpm run chromatic` to upload the build.
- Useful URLs:
  - Library: https://www.chromatic.com/library?appId=664da716aa9828a2c671d8b6&branch=master
  - Component: https://www.chromatic.com/component?appId=664da716aa9828a2c671d8b6&csfId=atoms-corebutton&branch=master

## Tests

- Coverage: `pnpm run test:unit:coverage`.
