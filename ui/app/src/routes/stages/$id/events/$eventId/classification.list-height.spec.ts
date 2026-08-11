import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { loggedOutTest } from "@test/utils/authFixtures";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

const CLASSIFICATION_URL = "/stages/stage-1/events/evt-1/classification";
const COMPETITOR_COUNT = 8;
const MOBILE_BOTTOM_GAP = 64;
const HEIGHT_TOLERANCE = 4;

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

const headerToggle = (page: Page) =>
  page
    .locator(".classification__mobile-collapsible-row")
    .getByRole("button")
    .first();

/** The list must take the space left under its own top edge, no more, no less. */
const expectListFillsViewport = async (page: Page) => {
  await expect
    .poll(
      () =>
        page.evaluate((gap) => {
          const list = document.querySelector<HTMLElement>(".obdx-clf__list");
          if (!list) return null;
          const expected = Math.floor(
            window.innerHeight - list.getBoundingClientRect().top - gap,
          );
          const actual = parseFloat(getComputedStyle(list).height);
          return Math.abs(actual - expected);
        }, MOBILE_BOTTOM_GAP),
      { timeout: 4_000 },
    )
    .toBeLessThanOrEqual(HEIGHT_TOLERANCE);
};

loggedOutTest.describe("Classification list height", () => {
  loggedOutTest(
    "keeps the list at the full available height while the header collapses and expands",
    async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (text.includes("Failed to load resource")) return;
        pageErrors.push(text);
      });

      await mockClassification(page);
      await page.goto(CLASSIFICATION_URL);

      await expect(
        page.locator(".obdx-clf__list .obdx-clf__position").first(),
      ).toBeVisible();
      await expectListFillsViewport(page);

      await headerToggle(page).click();
      await expectListFillsViewport(page);

      await headerToggle(page).click();
      await expectListFillsViewport(page);

      expect(pageErrors).toEqual([]);
    },
  );

  loggedOutTest(
    "keeps the list at the full available height after pinning and expanding a competitor",
    async ({ page }) => {
      await mockClassification(page);
      await page.goto(CLASSIFICATION_URL);

      const firstCard = page.locator(".obdx-clf__list > .card").first();
      await expect(firstCard).toBeVisible();

      await firstCard.getByRole("button", { name: "Pin", exact: true }).click();
      await expect(page.locator(".obdx-clf__pinned")).toBeVisible();
      await expectListFillsViewport(page);

      await page
        .locator(".obdx-clf__pinned")
        .getByRole("button", { name: "See detail" })
        .first()
        .click();
      await expectListFillsViewport(page);
    },
  );
});
