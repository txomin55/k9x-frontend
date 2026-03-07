# Dog-trainer-app

SvelteKit PWA powered by Vite and the shared components from the `library` package. Routing is handled by
SvelteKit, lightweight state is managed with Svelte stores, and internationalization uses `i18next` +
`i18next-http-backend`.

## Stack and configuration

- Build and dev server: SvelteKit + `@sveltejs/kit`, linting with `vite-plugin-eslint`, env loading with
  `vite-plugin-environment`.
- Aliases: `@` -> `src`, `@lib` -> `../library/src` (SVG assets copied on build with
  `vite-plugin-static-copy`).
- PWA: `@vite-pwa/sveltekit` in `injectManifest` mode with `src/service-worker.js` (Workbox), `VITE_APP_BASE_PATH` is
  used as the base for
  routes and SW registration.
- Polyfills: `rollup-plugin-node-polyfills` and esbuild plugins to expose `process`, `buffer`, `stream`, etc. in the
  browser; `globalThis` is defined for dependencies that require it.
- API: client generated on the fly with `openapi-client-axios`, base `VITE_APP_API_ADDRESS` and spec served from
  `VITE_APP_OAS`; language headers are updated based on the active locale.
- i18n: `i18next` with `i18next-http-backend` and language detector, loading strings from `static/locales/{{lng}}`.

## Environments and startup

1. Install dependencies at the workspace root (`pnpm install`).
2. Start in offline (mock) mode with:
    - `pnpm dev` or `pnpm start:offline` (starts Prism with `public/openapi.json` + Vite at http://localhost:3000).
3. Other modes:
    - `pnpm start:staging` (uses `.env.staging`).
4. Build and preview: `pnpm build` and `pnpm serve`.
5. Mock server only: `pnpm mock-server` (`prism mock -d public/openapi.json`).

## Testing

- Unit (Vitest, jsdom environment, shared config from `my-vitest`): `pnpm test:unit`.
- Unit coverage: `pnpm test:unit:coverage`.
- E2E (Cypress 14, Chrome):
    - `pnpm test:e2e` for headless runs against offline mode (`VITE_APP_IS_E2E=true`).
    - `pnpm test:e2e:dashboard` opens the runner; `pnpm test:e2e:real` records to the dashboard with `CY_E2E_KEY`.
    - E2E coverage via `cypress-cdp-coverage`; generates `.nyc_output/final.json` and
      `.reports/test/e2e/coverage/coverage-final.json`.
    - Reports: JUnit in `.reports/cypress/junit.xml` and, with `VITE_APP_IS_E2E=true`, Sonar in
      `.reports/tests/e2e/sonar/cypress-unit-report.xml`.
- Aggregated functional coverage (NYC): `pnpm test:functional-coverage`.
- Smoke without coverage: `pnpm test:smoke`.

## Additional notes

- SvelteKit runs in SPA mode (`ssr = false`) to match the previous client-only behavior; adjust if you want SSR later.
- The service worker clears obsolete caches and listens to `notificationclick` events to handle push notifications.
