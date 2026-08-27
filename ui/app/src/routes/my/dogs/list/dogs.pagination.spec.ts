import { expect, type Page } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { toDogsPage } from "@test/api-mocks/dogs";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

const DOGS_IN_THE_API = 120;
const PAGE_SIZE = 50;

const manyDogs = Array.from({ length: DOGS_IN_THE_API }, (_, index) => ({
  identification: `dog-${index}`,
  name: `Dog ${String(index).padStart(3, "0")}`,
  image: "",
  breed: { id: "labrador", name: "Labrador" },
  origin: `ES-DOG-${index}`,
  license: `LIC-${index}`,
  owner: "Carlos Competitor",
  handler: "Carlos Competitor",
  team: "Team Alpha",
  country: { id: "ES", name: "Spain" },
  sex: index % 2 === 0 ? "MALE" : "FEMALE",
  withersCm: 50,
  owned: true,
  threeFciGenerationsConfirmed: false,
}));

const mockPagedDogs = (page: Page) =>
  setRouteResponses(page, {
    method: "GET",
    payload: (_match, request) => toDogsPage(manyDogs, request.url()),
    pathname: "/secured/dogs",
  });

const grid = (page: Page) => page.locator(".virtual-card-grid");

const scrollToBottom = (page: Page) =>
  grid(page).evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

const loadedHeight = (page: Page) =>
  page
    .locator(".virtual-card-grid__canvas")
    .evaluate((element) => element.getBoundingClientRect().height);

competitorTest.describe("My dogs - paged scrolling", () => {
  competitorTest(
    "loads one page at a time and pulls the next one when the scroll reaches the end",
    async ({ page }) => {
      await mockPagedDogs(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Dog 000", { exact: true })).toBeVisible();

      // Only the first page is in: the last dog of the list cannot be reached yet.
      const firstPageHeight = await loadedHeight(page);
      await scrollToBottom(page);
      await expect(
        page.getByText(`Dog ${String(DOGS_IN_THE_API - 1).padStart(3, "0")}`, {
          exact: true,
        }),
      ).toHaveCount(0);

      // Reaching the end of the loaded rows brings the next page in, making the list taller.
      await expect
        .poll(() => loadedHeight(page))
        .toBeGreaterThan(firstPageHeight);

      await scrollToBottom(page);
      await expect
        .poll(() => loadedHeight(page))
        .toBeGreaterThan(firstPageHeight * 2);
      await scrollToBottom(page);
      await expect(
        page.getByText(`Dog ${String(DOGS_IN_THE_API - 1).padStart(3, "0")}`, {
          exact: true,
        }),
      ).toBeVisible();
    },
  );

  competitorTest(
    "keeps only the visible cards in the DOM",
    async ({ page }) => {
      await mockPagedDogs(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Dog 000", { exact: true })).toBeVisible();

      // A page of 50 dogs came back, but only the rows around the viewport are rendered.
      const renderedCards = await page
        .locator(".virtual-card-grid .card")
        .count();
      expect(renderedCards).toBeGreaterThan(0);
      expect(renderedCards).toBeLessThan(PAGE_SIZE);
    },
  );

  competitorTest(
    "filters against the API, so it finds dogs that were never loaded",
    async ({ page }) => {
      await mockPagedDogs(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Dog 000", { exact: true })).toBeVisible();

      // Dog 119 is not in the loaded page, so only a filter that travels to the API can find it.
      await page.getByLabel("Dog name").fill("Dog 119");

      await expect(page.getByText("Dog 119", { exact: true })).toBeVisible();
      await expect(page.getByText("Dog 000", { exact: true })).toHaveCount(0);
    },
  );
});
