import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { loggedOutTest } from "@test/utils/authFixtures";
import { defaultStageDetail } from "@test/api-mocks/stageDetail";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

const STAGE_ID = defaultStageDetail.id;
const EVENT_ID = defaultStageDetail.events[0].id;
const URL = `/stages/${STAGE_ID}/events/${EVENT_ID}/rankings`;

const setup = async (page: Page, delays: { list: number; results: number }) => {
  await page.route("**/stages/*/events/*/rankings", async (route) => {
    if (route.request().resourceType() === "document") {
      await route.fallback();
      return;
    }
    if (delays.list) {
      await new Promise((resolve) => setTimeout(resolve, delays.list));
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{ id: "ranking-1", name: "Season Ranking" }]),
    });
  });
  await page.route("**/rankings/ranking-1", async (route) => {
    if (route.request().resourceType() === "document") {
      await route.fallback();
      return;
    }
    if (delays.results) {
      await new Promise((resolve) => setTimeout(resolve, delays.results));
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ events: [], groups: [] }),
    });
  });
  await setRouteResponses(page, {
    method: "GET",
    pathname: `/stages/${STAGE_ID}`,
    payload: defaultStageDetail,
  });
};

loggedOutTest("skeleton while the rankings list loads", async ({ page }) => {
  loggedOutTest.setTimeout(120000);
  await setup(page, { list: 4000, results: 0 });

  await page.goto(URL);
  await expect(page.locator(".atom-skeleton").first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByText("Season Ranking").first()).toBeVisible({
    timeout: 30000,
  });
});

loggedOutTest("skeleton while the results load", async ({ page }) => {
  loggedOutTest.setTimeout(120000);
  await setup(page, { list: 0, results: 4000 });

  await page.goto(URL);
  await expect(page.getByText("Season Ranking").first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator(".atom-skeleton").first()).toBeVisible();
  await expect(page.locator(".atom-skeleton")).toHaveCount(0, {
    timeout: 30000,
  });
});
