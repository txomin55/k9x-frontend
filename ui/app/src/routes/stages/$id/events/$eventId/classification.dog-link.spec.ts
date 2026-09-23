import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { loggedOutTest } from "@test/utils/authFixtures";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

const CLASSIFICATION_URL = "/stages/stage-1/events/evt-1/classification";
const COMPETITOR_COUNT = 2;

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

loggedOutTest.describe("Classification dog links", () => {
  loggedOutTest(
    "opens the public detail of a dog from its name in the list",
    async ({ page }) => {
      await mockClassification(page);
      await page.goto(CLASSIFICATION_URL);

      await page
        .locator(".obdx-clf__list")
        .getByRole("link", { name: "Dog 2" })
        .click();

      await expect(page).toHaveURL(/\/dogs\/dog-2$/);
    },
  );

  loggedOutTest(
    "opens the public detail of a dog from its name in the table",
    async ({ page }) => {
      await mockClassification(page);
      await page.goto(`${CLASSIFICATION_URL}?view=TABLE`);

      await page
        .locator(".obdx-clf-table")
        .getByRole("link", { name: "Dog 2" })
        .click();

      await expect(page).toHaveURL(/\/dogs\/dog-2$/);
    },
  );
});
