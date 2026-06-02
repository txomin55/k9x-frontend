---
name: k9x-browser-test
description: Drive the k9x frontend in a real browser with a pre-configured Playwright harness. Use when the user wants to test/verify/reproduce app behavior in the browser and provides (or has stored) an auth token — e.g. "test this with my token", "reproduce the bug at <url>", "check the configuration select". Injects the token into localStorage, navigates, and streams console/network/error logs.
---

# k9x browser test

A ready-to-run Playwright harness for the k9x frontend. The user provides a valid
JWT once; everything else (token injection, browser boot, logging) is configured.

## Setup baked in

- **Token localStorage key:** `k9x_access_token`
- **Frontend origin:** `http://localhost:5173` (dev server must be running: `cd ui/app && pnpm dev`)
- **Backend origin:** `http://localhost:4000`
- **Playwright:** auto-resolved from `ui/app/node_modules` (`@playwright/test`, Chromium already installed) — the harness can be run from any directory.
- Harness script: `runner.mjs` in this skill directory.

## Token handling

Resolution order: `--token` flag → `$K9X_TOKEN` env → `<repo>/.k9x-token` file.

When the user gives a token, write it once so later runs don't need it again:

```bash
printf '%s' '<JWT>' > /home/txomin/Desktop/repositories/k9x/k9x-frontend/.k9x-token
```

`.k9x-token` is gitignored. The harness warns (but still runs) if the token's `exp` is in the past — k9x tokens are short-lived, so if requests 401, ask the user for a fresh one.

## Running

Run from anywhere (paths below assume the repo root):

```bash
cd /home/txomin/Desktop/repositories/k9x/k9x-frontend
node .claude/skills/k9x-browser-test/runner.mjs --path "/my/competitions" --dump-selector "body"
```

Common flags (full list at the top of `runner.mjs`):

- `--path "<route>"` route relative to the frontend origin, or `--url "<full>"`.
- `--net "events,configurations"` substrings to log network for (default `secured,/api`; `*` = all, `""` = none). GET response bodies are truncated to 2 KB; mutating requests (PUT/POST/PATCH/DELETE) log their payload.
- `--wait <ms>` settle time after load and after the script (default 2500).
- `--headed` visible browser.
- `--dump-selector "<css>"` print `innerText` of the first match after settling.
- `--screenshot "<file.png>"` full-page screenshot at the end.
- `--script "<file.mjs>"` interaction module (see below).

Exit code is `1` if any page error or interaction error occurred — useful for asserting a clean run.

## Interaction scripts

For clicking, typing, and asserting, write a small module and pass `--script`.
It receives the Playwright `page` and a context with Playwright's `expect`:

```js
// /tmp/check-config.mjs
export default async (page, { expect, log }) => {
  await page.getByText("Edit", { exact: true }).click();
  await page.waitForTimeout(1000);
  const section = page.locator(".event-configuration-section");
  await expect(section).toContainText("FCI Grade 1"); // config must survive entering edit mode
  log("config select OK");
};
```

```bash
cd /home/txomin/Desktop/repositories/k9x/k9x-frontend
node .claude/skills/k9x-browser-test/runner.mjs \
  --url "http://localhost:5173/my/competitions/<id>/stages/<sid>/events/<eid>" \
  --script /tmp/check-config.mjs --net "events,configurations"
```

## Tips

- To catch spurious mutations (the kind of bug where opening edit mode silently fires a `PUT`), watch the `REQ> PUT ...` lines — there should be none until the user actually changes something.
- Put throwaway interaction scripts in `/tmp`, not in the repo.
- If the dev server isn't up, the run will show `GOTO>` connection errors — start it first.
