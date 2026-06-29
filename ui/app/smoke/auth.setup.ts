import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  ACCESS_TOKEN_KEY,
  GOOGLE_LOGIN_TIMEOUT,
  SMOKE_CREDENTIALS_PATH,
  SMOKE_STATE_PATH,
} from "./utils/constants";

const TOKEN_FILE = ".auth/token.txt";
const REFRESH_FILE = ".auth/refresh.txt";

type Credentials = { email: string; password: string };

const readCredentials = (): Credentials | null => {
  const email = process.env.SMOKE_GOOGLE_EMAIL?.trim();
  const password = process.env.SMOKE_GOOGLE_PASSWORD?.trim();
  if (email && password) return { email, password };

  if (fs.existsSync(SMOKE_CREDENTIALS_PATH)) {
    const parsed = JSON.parse(fs.readFileSync(SMOKE_CREDENTIALS_PATH, "utf-8"));
    if (parsed?.email && parsed?.password) {
      return { email: String(parsed.email), password: String(parsed.password) };
    }
  }
  return null;
};

const readToken = (page: import("@playwright/test").Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), ACCESS_TOKEN_KEY);

// Drive Google's OAuth (GAIA) flow with its stable element ids: the email
// step (#identifierId / #identifierNext), the password step
// (input[name="Passwd"] / #passwordNext), and the optional consent screen.
const fillGoogleLogin = async (
  page: import("@playwright/test").Page,
  { email, password }: Credentials,
) => {
  const clickNext = async () => {
    const byId = page.locator("#identifierNext button, #passwordNext button").first();
    if (await byId.isVisible().catch(() => false)) {
      await byId.click();
      return;
    }
    await page
      .getByRole("button", { name: /next|siguiente/i })
      .first()
      .click();
  };

  // Email step — id varies across Google layouts (#identifierId vs plain input).
  const emailInput = page
    .locator('#identifierId, input[type="email"]')
    .first();
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await emailInput.fill(email);
  await clickNext();

  // Password step.
  const passwordInput = page
    .locator('input[name="Passwd"], input[type="password"]')
    .first();
  await passwordInput.waitFor({ state: "visible", timeout: 30_000 });
  await passwordInput.fill(password);
  await clickNext();

  // Optional consent / "Continue" screen — only present on some flows.
  const consent = page
    .getByRole("button", { name: /continue|continuar|allow|permitir/i })
    .first();
  await consent
    .waitFor({ state: "visible", timeout: 10_000 })
    .then(() => consent.click())
    .catch(() => undefined);
};

const seedToken = (): string | null => {
  if (process.env.SMOKE_ACCESS_TOKEN) return process.env.SMOKE_ACCESS_TOKEN.trim();
  if (fs.existsSync(TOKEN_FILE)) return fs.readFileSync(TOKEN_FILE, "utf-8").trim();
  return null;
};

const seedRefresh = (): string | null => {
  if (process.env.SMOKE_REFRESH_TOKEN) return process.env.SMOKE_REFRESH_TOKEN.trim();
  if (fs.existsSync(REFRESH_FILE)) return fs.readFileSync(REFRESH_FILE, "utf-8").trim();
  return null;
};

const gotoStable = async (
  page: import("@playwright/test").Page,
  url: string,
) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
      await page.waitForTimeout(1500);
    }
  }
};

const persist = (
  context: import("@playwright/test").BrowserContext,
) => {
  fs.mkdirSync(path.dirname(SMOKE_STATE_PATH), { recursive: true });
  return context.storageState({ path: SMOKE_STATE_PATH });
};

// Visit every route template once so the dev server finishes optimizing
// dependencies up front; otherwise the first hit on each chunk during a journey
// triggers a vite re-optimization that full-reloads the page mid-test.
const WARM_ROUTES = [
  "/my/judges/list",
  "/my/dogs/list",
  "/my/competitions/list",
  "/my/collections/list",
  "/my/competitions/warm",
  "/my/competitions/warm/stages/warm",
  "/my/competitions/warm/stages/warm/events/warm",
  "/my/collections/warm",
  "/stages/warm/info",
  "/stages/warm/events/warm/classification",
];

const warmRoutes = async (page: import("@playwright/test").Page) => {
  for (const route of WARM_ROUTES) {
    await gotoStable(page, route).catch(() => undefined);
    await page.waitForLoadState("networkidle").catch(() => undefined);
  }
};

test("authenticate", async ({ browser }) => {
  test.setTimeout(GOOGLE_LOGIN_TIMEOUT + 30_000);

  const token = seedToken();
  if (token) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await gotoStable(page, "/");
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [ACCESS_TOKEN_KEY, token] as const,
    );
    const refresh = seedRefresh();
    if (refresh) {
      await context.addCookies([
        {
          name: "refresh_token",
          value: refresh,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
    }
    await gotoStable(page, "/my/dogs/list");
    await expect(
      page.getByRole("button", { name: "+", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await warmRoutes(page);
    await persist(context);
    await context.close();
    return;
  }

  if (fs.existsSync(SMOKE_STATE_PATH)) {
    const reuseContext = await browser.newContext({
      storageState: SMOKE_STATE_PATH,
    });
    const reusePage = await reuseContext.newPage();
    await gotoStable(reusePage, "/my/dogs/list");
    const stillAuthed = await reusePage
      .getByRole("button", { name: "+", exact: true })
      .isVisible()
      .catch(() => false);

    if (stillAuthed && (await readToken(reusePage))) {
      await persist(reuseContext);
      await reuseContext.close();
      return;
    }
    await reuseContext.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Login" }).click();

  const credentials = readCredentials();
  if (credentials) {
    await fillGoogleLogin(page, credentials).catch((error) => {
      console.warn(
        "Auto Google login failed, falling back to manual login:",
        error instanceof Error ? error.message : error,
      );
    });
  }

  await expect
    .poll(() => readToken(page).catch(() => null), {
      timeout: GOOGLE_LOGIN_TIMEOUT,
    })
    .toBeTruthy();

  await persist(context);
  await context.close();
});
