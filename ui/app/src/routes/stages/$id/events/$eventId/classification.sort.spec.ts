import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { competitorTest, loggedOutTest } from "@test/utils/authFixtures";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

const CLASSIFICATION_URL = "/stages/stage-1/events/evt-1/classification";
const COMPETITOR_COUNT = 4;

// startOrder is the reverse of the final position, so the two orderings can
// never be confused with each other.
const makeCompetitor = (
  position: number,
): StageEventClassificationItemResponseDTO => ({
  country: { id: "ES", name: "Spain" },
  dog: { id: `dog-${position}`, name: `Dog ${position}` },
  exercises: [],
  owner: `Owner ${position}`,
  handler: `Handler ${position}`,
  position,
  competitorNumber: position,
  scoreRating: 1,
  status: "COMPLETED",
  team: `Team ${position}`,
  totalScore: 300 - position,
  tied: false,
  startOrder: COMPETITOR_COUNT + 1 - position,
  bih: false,
  reserve: false,
  awards: [],
  qualification: "Excellent",
});

const classification: StageEventClassificationResponseDTO = {
  event: { id: "evt-1", name: "Qualification 1" },
  competitionName: "Qualifications",
  discipline: { id: "disc-1", name: "OBDX" },
  rank: "A",
  stage: { id: "stage-1", name: "Qualifications" },
  configuration: { id: "config-1", name: "FCI Grade 3" },
  lastUpdated: 1_730_050_000_000,
  status: "COMPLETED",
  obdx: {
    scoreCalculation: "AVG",
    judges: [{ id: "judge-1", name: "Maria Lopez" }],
    competitors: Array.from({ length: COMPETITOR_COUNT }, (_, index) =>
      makeCompetitor(index + 1),
    ),
  },
};

const mockClassification = (page: Page) =>
  setRouteResponses(page, {
    method: "GET",
    payload: classification,
    pathname: "/events/*/classification",
  });

const listedPositions = (page: Page) =>
  page.locator(".obdx-clf__list .obdx-clf__position").allInnerTexts();

// On mobile the filter and the sort select live inside the header collapsible.
const openHeaderTools = async (page: Page) => {
  await page
    .locator(".classification__mobile-collapsible-row")
    .getByRole("button")
    .first()
    .click();
};

const selectSort = async (page: Page, option: string) => {
  await page.getByLabel("Sort by").click();
  await page.getByRole("option", { name: option }).click();
};

competitorTest.describe("Classification sorting - logged in", () => {
  competitorTest(
    "sorts by start order through the URL and keeps the competitor filter",
    async ({ page }) => {
      await mockClassification(page);
      await page.goto(CLASSIFICATION_URL);

      await expect(
        page.locator(".obdx-clf__list .obdx-clf__position").first(),
      ).toBeVisible();
      expect(await listedPositions(page)).toEqual(["#1", "#2", "#3", "#4"]);

      await openHeaderTools(page);
      await expect(page.getByLabel("Sort by")).toBeVisible();
      await selectSort(page, "Start order");

      await expect(page).toHaveURL(/sort=START_ORDER/);
      expect(await listedPositions(page)).toEqual(["#4", "#3", "#2", "#1"]);

      const filter = page.getByRole("combobox", { name: "Filter competitors" });
      await filter.click();
      await filter.fill("Dog 2");
      await page.locator(".atom-combobox__listbox").getByText("Dog 2").click();
      await page.keyboard.press("Escape");

      await expect(page).toHaveURL(/competitors=dog-2/);
      await expect(page).toHaveURL(/sort=START_ORDER/);
      expect(await listedPositions(page)).toEqual(["#2"]);

      await selectSort(page, "Final score");

      await expect(page).toHaveURL(/competitors=dog-2/);
      await expect(page).not.toHaveURL(/sort=/);
    },
  );

  competitorTest(
    "applies the sort from the URL on first load",
    async ({ page }) => {
      await mockClassification(page);
      await page.goto(`${CLASSIFICATION_URL}?sort=START_ORDER`);

      await expect(
        page.locator(".obdx-clf__list .obdx-clf__position").first(),
      ).toBeVisible();
      expect(await listedPositions(page)).toEqual(["#4", "#3", "#2", "#1"]);
    },
  );
});

loggedOutTest.describe("Classification sorting - logged out", () => {
  loggedOutTest("does not show the sort select", async ({ page }) => {
    await mockClassification(page);
    await page.goto(CLASSIFICATION_URL);

    await expect(
      page.locator(".obdx-clf__list .obdx-clf__position").first(),
    ).toBeVisible();
    await openHeaderTools(page);

    await expect(page.getByLabel("Sort by")).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Filter competitors" }),
    ).toHaveCount(0);
  });
});
