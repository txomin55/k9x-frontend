# k9x-frontend

pnpm/turbo monorepo with a React PWA and a component library. Uses Vite 7, React 19, Vitest, Cypress, and Storybook/Chromatic.

## Requirements and setup

- Node v24.11.1 (`.nvmrc`).
- pnpm 10.30.0 (`packageManager` and `preinstall` with `only-allow pnpm`).
- Enable Corepack and prepare pnpm before installing:
  - `make install-tools` (nvm uses the `.nvmrc` version + prepares pnpm via Corepack according to `packageManager`)
  - `pnpm install`
 
## Project structure

- `ui/app`: React + Vite PWA, VitePWA, Prism mock server over `public/openapi.json`, Cypress for E2E and Vitest for unit tests.
- `ui/library`: React component library with Vite, Storybook 10/Chromatic, and Vitest.
- `configuration/my-vitest` and `configuration/my-eslint`: shared presets for Vitest + ESLint (flat config, Prettier).
- `coverage_processor`: utilities to merge coverage and junit.

## Local development

- `pnpm dev`: starts Turbo and runs `ui/app/start:offline` (Vite at http://localhost:3000 and Prism mock at http://127.0.0.1:4010).
- `pnpm --filter ./ui/app start:integrated|start:develop|serve`: alternative Vite modes if you need another environment.
- `pnpm build`: `turbo run build -- --mode ${CI_BUILD_ENV}` (uses `CI_BUILD_ENV` to select the mode; output goes to `ui/app/dist`).

## Quality and formatting

- `pnpm lint`: ESLint 9 with presets from `configuration/` and React/Vitest rules.
- `pnpm format`: Prettier 3 for `*.{cjs,js,jsx,md,mdx}`.
- Pre-commit via Make: `make pre-commit` runs `pnpm lint` + `pnpm test:unit`.

## Tests and coverage

- Unit (Vitest, app + library):
  - `pnpm test:unit`
  - `pnpm test:unit:coverage` generates coverage in `.reports/test/unit/coverage` and junit/Sonar in `.reports/test/unit` + `.reports/sonar`.
  - `pnpm unit:coverage-merge` merges coverage from app and library; `pnpm unit:merge` merges junit.
- E2E (Cypress 14):
  - `pnpm test:e2e` launches the app in offline mode, runs in headless Chrome with `VITE_APP_IS_E2E=true`, produces `cypress/junit.xml`, coverage in `ui/app/coverage`, and Sonar reports in `coverage/sonar`.
  - Useful local commands in `ui/app`: `test:e2e:dashboard`, `test:e2e:real`, `local:test:e2e`, etc.
- Combined coverage:
  - `pnpm functional:coverage` shows the NYC summary of E2E coverage.
  - `pnpm total:coverage-merge` mixes unit (merged) + Cypress coverage and writes `lcov.info` and `cobertura-coverage.xml` to `.reports/test/total/coverage`.

## GitLab pipeline (.gitlab-ci.yml)

- Base image Node `24.11.1-slim` and cached pnpm (`.pnpm-store` + Cypress binary).
- `test_deploy/pages`: build with `CI_BUILD_ENV=staging`, move `ui/app/dist` to `public` and gzip; publishes artifact `public` and defines `RELEASE_NAME` for the release.
- `release/ReleaseCreation`: uses `release-cli` to create the release with tag `RELEASE_NAME`.
- `test`:
  - `UnitTests`: `pnpm test:unit:coverage`, then `unit:coverage-merge` + `unit:merge`; exports junit and `.reports`.
  - `E2ETests`: `pnpm test:e2e`, then `functional:coverage`; exports `coverage`, `cypress`, and `.reports`.
- `test_summary/TestSummary`: runs `total:coverage-merge` and publishes combined Cobertura coverage.
- `code_checks/SonarCheck`: `sonar-scanner` using the reports generated in `.reports`.
