// k9x browser test harness.
// Boots Chromium via the project's Playwright install, injects the auth token
// into localStorage before the app loads, navigates to a path, and streams
// console / pageerror / network logs. Optionally runs an interaction module.
//
// Resolve order for the token: --token > $K9X_TOKEN > <repo>/.k9x-token file.
//
// Run it from the ui/app directory so `@playwright/test` resolves, e.g.:
//   cd ui/app && node ../../.claude/skills/k9x-browser-test/runner.mjs --path "/my/competitions"
//
// Flags:
//   --path "<route>"     Route to open (joined to --base). Default "/".
//   --url "<full url>"   Full URL (overrides --path/--base).
//   --base "<origin>"    Frontend origin. Default http://localhost:5173.
//   --token "<jwt>"      Auth token (else $K9X_TOKEN, else <repo>/.k9x-token).
//   --net "a,b"          Substrings; log requests/responses whose URL matches any.
//                        Default "secured,/api". Use "" to disable, "*" for all.
//   --wait <ms>          Idle wait after load (and after the script). Default 2500.
//   --headed             Run with a visible browser window.
//   --script "<file>"    JS module: `export default async (page, ctx) => {}`.
//                        ctx = { expect, log, base, url }. Runs after load.
//   --dump-selector "s"  After settle, print innerText of this selector.
//   --screenshot "f.png" Save a screenshot at the end.
//
// The script exit code is 1 if any pageerror fired or the interaction threw.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, isAbsolute } from "node:path";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const TOKEN_KEY = "k9x_access_token";

// Playwright lives in ui/app's node_modules; ESM resolves bare specifiers
// relative to this file, so resolve it from ui/app explicitly.
const uiAppRequire = createRequire(pathToFileURL(resolve(REPO, "ui/app/package.json")).href);
const pw = await import(pathToFileURL(uiAppRequire.resolve("@playwright/test")).href);
const { chromium, expect } = pw.chromium ? pw : pw.default;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true; // boolean flag
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function resolveToken(args) {
  if (typeof args.token === "string") return args.token.trim();
  if (process.env.K9X_TOKEN) return process.env.K9X_TOKEN.trim();
  const tokenFile = resolve(REPO, ".k9x-token");
  if (existsSync(tokenFile)) return readFileSync(tokenFile, "utf8").trim();
  return null;
}

function decodeExp(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

const args = parseArgs(process.argv.slice(2));
const base = (args.base ?? "http://localhost:5173").replace(/\/$/, "");
const url = args.url ?? base + (args.path ? `/${String(args.path).replace(/^\//, "")}` : "/");
const waitMs = Number(args.wait ?? 2500);
const netRaw = args.net ?? "secured,/api";
const netFilters = netRaw === "*" ? null : String(netRaw).split(",").map((s) => s.trim()).filter(Boolean);

const token = resolveToken(args);
if (!token) {
  console.error(
    `No token found (checked --token, $K9X_TOKEN, ${resolve(REPO, ".k9x-token")}). Continuing without auth — fine for public pages, but anything behind login will 401.`,
  );
} else {
  const exp = decodeExp(token);
  if (exp && exp * 1000 < Date.now()) {
    console.error(
      `WARNING: token appears expired (exp ${new Date(exp * 1000).toISOString()}). Continuing anyway.`,
    );
  }
}

const matchesNet = (u) => netFilters === null || netFilters.some((f) => u.includes(f));

const browser = await chromium.launch({ headless: !args.headed });
const context = await browser.newContext();
const page = await context.newPage();

let hadPageError = false;

page.on("console", (m) => console.log(`PAGE[${m.type()}]`, m.text()));
page.on("pageerror", (e) => {
  hadPageError = true;
  console.log("PAGEERR>", e.message);
});
page.on("requestfailed", (r) => {
  if (matchesNet(r.url())) console.log("REQFAIL>", r.method(), r.url(), r.failure()?.errorText);
});
page.on("request", (r) => {
  if (["PUT", "POST", "PATCH", "DELETE"].includes(r.method()) && matchesNet(r.url())) {
    console.log("REQ>", r.method(), r.url(), r.postData() ?? "");
  }
});
page.on("response", async (res) => {
  if (!matchesNet(res.url())) return;
  let body = "";
  try {
    if (res.request().method() === "GET") body = (await res.text()).slice(0, 2000);
  } catch {}
  console.log("RES>", res.status(), res.request().method(), res.url(), body);
});

if (token) {
  await page.addInitScript(
    ([key, value]) => globalThis.localStorage.setItem(key, value),
    [TOKEN_KEY, token],
  );
}

console.log(`→ opening ${url}`);
await page.goto(url, { waitUntil: "networkidle" }).catch((e) => console.log("GOTO>", e.message));
await page.waitForTimeout(waitMs);
console.log(`→ landed on ${page.url()}`);

if (args.script) {
  const scriptPath = isAbsolute(args.script) ? args.script : resolve(process.cwd(), args.script);
  const mod = await import(pathToFileURL(scriptPath).href);
  const fn = mod.default;
  if (typeof fn !== "function") {
    console.error(`Script ${scriptPath} must export a default async function.`);
  } else {
    try {
      await fn(page, { expect, log: (...a) => console.log("LOG>", ...a), base, url });
      await page.waitForTimeout(waitMs);
    } catch (e) {
      hadPageError = true;
      console.log("SCRIPTERR>", e.message);
    }
  }
}

if (args["dump-selector"]) {
  try {
    console.log(`\n=== ${args["dump-selector"]} ===\n` + (await page.locator(args["dump-selector"]).first().innerText()));
  } catch (e) {
    console.log("DUMP>", e.message);
  }
}

if (args.screenshot) {
  const shotPath = isAbsolute(args.screenshot) ? args.screenshot : resolve(process.cwd(), args.screenshot);
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(`→ screenshot saved to ${shotPath}`);
}

await browser.close();
process.exit(hadPageError ? 1 : 0);
