---
name: k9x-playwright-tests
description: Conventions and helpers for writing Playwright e2e tests in the k9x frontend (ui/app). Use when adding or editing `*.spec.ts` tests — auth fixtures, API mocking, accessible selectors, and the mandatory local-first checks for write flows (optimistic UI, offline queue, rehydration). Triggers e.g. "add a playwright test", "test this flow e2e", "write an e2e for the competitor enroll".
---

# k9x Playwright tests

Conventions for e2e tests in `ui/app`. Tests are `*.spec.ts` colocated under
`src/`, run on a **mobile** viewport (Pixel 5), and reuse the running dev server.

## Run

```bash
cd ui/app
npx playwright test src/routes/<area>/<file>.spec.ts --reporter=list
```

- Config: `ui/app/playwright.config.ts` (testDir `src/`, testMatch `**/*.spec.ts`,
  single project **Mobile Chrome**, `reuseExistingServer` locally).
- A dev server on `:5173` is reused if already running. Its mode (standalone/
  integrated) does **not** matter — mocking is host-agnostic (see below).

## Auth fixtures — pick the `test` per auth state

Import from `@test/utils/authFixtures` (not `@playwright/test`):

- `loggedOutTest` — no token; `/secured/user` & `/refresh` return 401.
- `competitorTest` — logged in, `organizer: false`.
- `organizerTest` — logged in, `organizer: true`.

```ts
import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("...", () => {
  competitorTest("...", async ({ page, context }) => { /* ... */ });
});
```

Each fixture seeds/clears the token via `addInitScript` and applies the default
mocks. Fixtures run **after** `defaultApiResponses`, so their overrides win.

## API mocking

- **Shared mocks for all fixtures** live in `playwright/utils/defaultApiResponses.ts`
  (applied to every test via the auto fixture). Add public/secured endpoints used
  across flows here, inside the `Promise.all`.
- **Payloads** live in `playwright/api-mocks/` (typed against the app DTOs).
- Register a mock with `setRouteResponses(page, { method, pathname, payload, status? })`.
- **Paths are explicit strings — no regex.** `*` matches a single path segment
  (e.g. `"/secured/dogs/*"`, `"/events/*/classification"`). Matching is by path on
  any non-app origin, so a SPA navigation to a same-named route (e.g. visiting
  `/stages`) is never answered with a mock.
- Use `Promise.all` when registering several mocks.

## Selectors — accessible, explicit, no CSS classes

- **Never** select by CSS class. Use roles, accessible names, and visible text.
- **Be explicit, not dynamic** — prefer literal names over array indices
  (`getByRole("article").filter({ hasText: "Sevilla Summer Trial" })`).
- **The app must be accessible.** If an element has no accessible name, fix the
  app (add `alt` / `aria-label`) instead of reaching for a class selector — that is
  a real a11y improvement, not a test hack.
- `toHaveURL` with a **relative path string**, no domain, no regex:
  `await expect(page).toHaveURL("/stages")`.
- **Kobalte SegmentedControl tabs**: click the label **text** (the radio input is
  hidden and intercepted); assert with
  `expect(page.getByRole("radio", { name: "Table" })).toBeChecked()`.
- **Kobalte Combobox**: options are virtualized — select by keyboard, not by
  clicking the option:
  ```ts
  const combo = page.getByRole("combobox", { name: "Dog" });
  await combo.click();
  await combo.fill("Koda");
  await combo.press("ArrowDown");
  await combo.press("Enter");
  ```
- **Dialogs**: scope to `page.getByRole("dialog")` to disambiguate buttons that
  also exist behind the dialog (e.g. an "Enroll" trigger and the dialog's "Enroll").
- On mobile the sidebar is collapsed on the landing page — open it via the
  hamburger (`.app-layout__navigation-toggle` is class-only; if you need it, that
  is the one pragmatic exception, or assert via the link it reveals).

## Write flows MUST validate local-first

Every test that performs a **write** must validate the local-first contract with
`verifyLocalFirstWrite` from `@test/utils/localFirst`:

1. **Optimistic UI** — the result shows immediately offline, with no server call.
2. **Offline accumulation** — the mutation is queued as a `PendingTask`.
3. **Flush** — the queued request is sent on reconnect.
4. **Rehydration** — the result survives a reload.

```ts
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

await verifyLocalFirstWrite(page, context, {
  mutation: { method: "PUT", urlIncludes: "/enroll" },
  entityType: "stage-enroll", // PendingTask.entityType
  performMutation: async () => { /* click/fill/confirm the write */ },
  assertOptimistic: async () => { /* assert the optimistic result is visible */ },
  // assertRehydrated?: defaults to assertOptimistic
});
```

The caller must, **before** calling it: navigate to the page under test, and set
up a **stateful** server mock so the post-flush reload reflects the write.

**Specs stay declarative — no `page.route`, no `if`/branching in the test.** Put
the stateful mock in the resource's `api-mocks/<name>.ts` module as a
`setup…(page)` helper and call it from the spec. `setRouteResponses` already
re-invokes a function `payload` per request and passes it `(match, request)`, so
statefulness needs no raw routes:

```ts
// playwright/api-mocks/<name>.ts
export const setupThing = (page: Page) => {
  const state = structuredClone(defaultThing);
  return Promise.all([
    setRouteResponses(page, { method: "GET", pathname: "/secured/things/*",
      payload: () => state }),                          // live: reflects mutations
    setRouteResponses(page, { method: "PUT", pathname: "/secured/things/*", status: 204,
      payload: (_match, request) => { applyChange(state, request.postDataJSON()); return ""; } }),
  ]);
};
```

```ts
// the spec — declarative
await setupThing(page);
await page.goto("/…");
await verifyLocalFirstWrite(page, context, { /* … */ });
```

Mutation/lookup logic (e.g. `applyChange`) lives in the mock module, never in the
spec.

Other helpers in `@test/utils/localFirst`: `readPendingTasks(page)`,
`trackRequests(page, { method, urlIncludes })`, `goOffline(page, context)`,
`goOnline(context)`.

Local-first storage facts: IndexedDB `k9x-local-first`, stores `pending_tasks`
(offline queue) and `query_snapshots` (key `stage:<id>` etc.). Offline is driven
by `context.setOffline(true)`; AppLayout shows the text **"Offline"**.

## Adding a new mock payload

1. Create `playwright/api-mocks/<name>.ts` exporting a typed payload.
2. If shared across flows, register it in `defaultApiResponses.ts`; otherwise
   register it in the spec (or a fixture) with `setRouteResponses`.
