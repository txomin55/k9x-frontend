# k9x-frontend

pnpm/turbo monorepo with a SolidJS PWA and a component library. Uses Vite 7, SolidJS, Vitest, Playwright, and Storybook/Chromatic.

## Requirements and setup

- Node v24.11.1 (`.nvmrc`).
- pnpm 10.30.0 (`packageManager` and `preinstall` with `only-allow pnpm`).
- Enable Corepack and prepare pnpm before installing:
  - `make install-tools` (nvm uses the `.nvmrc` version + prepares pnpm via Corepack according to `packageManager`)
  - `pnpm install`

## Project structure

- `ui/app`: SolidJS + Vite PWA, Prism mock server over a runtime-generated `static/openapi.yaml`, Playwright for E2E and Vitest for unit tests.
- `ui/library`: SolidJS component library with Vite, Storybook 10/Chromatic, and Vitest.
- `configuration/my-vitest` and `configuration/my-eslint`: shared presets for Vitest + ESLint (flat config, Prettier).
- `coverage_processor`: utilities to merge coverage and junit.

## Local development

- `pnpm dev`: runs `ui/app/start:integrated`.
- `pnpm --filter ./ui/app run start:offline`: builds the service worker, prepares the offline OpenAPI spec, starts Prism on `http://127.0.0.1:4010`, and starts Vite on `http://127.0.0.1:3000`.
- `pnpm --filter ./ui/app run start:integrated|serve|preview`: alternative app modes.
- `pnpm build`: `turbo run build -- --mode ${CI_BUILD_ENV}` (uses `CI_BUILD_ENV` to select the mode for each package build).

## Quality and formatting

- `pnpm lint`: ESLint 9 with presets from `configuration/` and Vitest rules.
- `pnpm format`: Prettier 3 for `*.{cjs,js,jsx,ts,tsx,md,mdx}`.
- `pnpm typecheck`: runs TypeScript checks for app, Playwright, library, shared config, and coverage processor.
- Pre-commit via Make: `make pre-commit` runs `pnpm lint` + unit tests.

## Tests and coverage

- Unit (Vitest, app + library):
  - `pnpm test:unit:coverage` generates coverage in `.reports/test/unit/coverage` and junit/Sonar in `.reports/test/unit` + `.reports/sonar/unit`.
  - `pnpm unit:coverage-merge` merges coverage from app and library; `pnpm unit:junit-merge` merges JUnit reports.
- E2E (Playwright, Chromium):
  - `pnpm test:e2e:coverage` launches the app in offline mode and runs the Playwright suite against Chromium.
  - Reports are written to `ui/app/.reports/test/e2e/junit.xml`, `ui/app/.reports/test/e2e/playwright`, `ui/app/.reports/test/e2e/coverage`, and `ui/app/.reports/sonar/e2e/sonar.xml`.
- Combined coverage:
  - `pnpm total:coverage-merge` mixes merged unit coverage with Playwright E2E coverage and writes `lcov.info` and `cobertura-coverage.xml` to `.reports/test/total/coverage`.

## CI workflow

- GitHub Actions workflow lives in `.github/workflows/pull-request.yml`.
- `unit_tests`: installs dependencies, runs unit coverage, and uploads `.reports`.
- `e2e_tests`: caches Playwright browsers under `ui/app/.cache/ms-playwright`, prepares the offline OpenAPI spec, runs Playwright E2E coverage, and uploads `.reports`.
- `test_summary`: downloads unit/e2e artifacts, merges coverage, and publishes the combined Cobertura report.
- `sonar_check`: downloads the same artifacts and runs the SonarQube scan against `.reports`.
