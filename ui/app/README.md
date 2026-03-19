# Dog-trainer-app

SolidJS PWA powered by Vite and the shared components from the `library` package. Routing is handled by
`@tanstack/solid-router`, lightweight state is managed with Solid signals/stores, and internationalization uses
`i18next` + `i18next-http-backend`.

## Stack and configuration

- Build and dev server: Vite + SolidStart, linting with `vite-plugin-eslint`.
- Aliases: `@` -> `src`, `@lib` -> `../library/src`.
- Pages output: Nitro is configured with the `github-pages` preset and emits the static site into `.output/public`.
- PWA: source in `src/sw.ts`, bundled separately with `vite.sw.config.ts`, and served as generated `static/sw.js`.
  Registration stays in `src/entry-client.tsx`. `VITE_APP_BASE_PATH` is used as the base for routes and service
  worker registration. Animal SVGs are cached at runtime and warmed in the background instead of being precached
  during service worker installation.
- API: Language headers are updated based on the active locale.
- i18n: `i18next` with `i18next-http-backend` and language detector, loading strings from `static/locales/{{lng}}`.
- Animal SVGs live in `ui/library/src/assets/svg/animals` and are copied into the final GitHub Pages artifact by
  `ci-scripts/pages.sh` as `public/animals/*.svg`.

## Environments and startup

1. Install dependencies at the workspace root (`pnpm install`).
2. Start in standalone (mock) mode with:
    - `pnpm run start:standalone` (builds `static/sw.js`, downloads the standalone OAS into `static/openapi.yaml`,
      starts Prism at `http://127.0.0.1:4010`, and starts Vite at `http://127.0.0.1:3000`).
3. Start in integrated mode with:
    - `pnpm run dev` or `pnpm run start:integrated`.
4. Service worker builds:
    - `pnpm run build:sw` builds `static/sw.js` with `--mode ${CI_BUILD_ENV:-production}`.
    - `pnpm run build:sw:develop` builds `static/sw.js` in standalone mode for local dev flows.
5. App build and preview:
    - `pnpm run build`
    - `pnpm run preview`
    - `pnpm run serve`
6. Mock server only:
    - `pnpm run prepare:standalone-oas && pnpm run mock-server`
7. CI web server mode:
    - `pnpm run start:standalone:prepared` expects `static/openapi.yaml` to already exist and does not download it
      again.
8. GitHub Pages artifact build: `bash ./ci-scripts/pages.sh`.

## Testing

- Unit coverage: `pnpm run test:unit:coverage`.
  Coverage uses the Vitest `v8` provider. Reports include `ui/app` files plus any `ui/library` components that are
  actually executed from app tests. This is intentional so shared UI exercised through the app is accounted for without
  forcing coverage over the whole library package.
- E2E (Playwright, Chromium):
    - `pnpm run test:e2e:coverage` runs the Playwright suite against standalone mode.
    - Playwright starts `pnpm run start:standalone` locally and `pnpm run start:standalone:prepared` in CI.
    - Coverage is generated via `monocart-coverage-reports` into `.reports/test/e2e/coverage`.
    - Reports:
        - JUnit: `.reports/test/e2e/junit.xml`
        - Sonar: `.reports/sonar/e2e/sonar.xml`
        - Playwright artifacts: `.reports/test/e2e/playwright`

## Additional notes

- The app runs as a static SPA with a browser router and a configurable base path for GitHub Pages style deployments.
- The current prerender seed is intentionally minimal (`/` and `/404.html`); client-side routing handles the rest.
- The service worker claims clients immediately, clears stale caches on activation, listens to `notificationclick`
  events, and applies runtime caching for app shell assets plus animal SVGs.
