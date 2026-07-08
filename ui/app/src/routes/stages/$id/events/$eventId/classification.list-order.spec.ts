import { expect } from "@playwright/test";
import { loggedOutTest } from "@test/utils/authFixtures";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import type {
  StageEventClassificationExerciseScoresResponseDTO,
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

const makeExercises = (
  count: number,
): StageEventClassificationExerciseScoresResponseDTO[] =>
  Array.from({ length: count }, (_, i) => ({
    exercise: { id: `ex-${i}`, name: `EX${i}` },
    scores: [],
    exerciseScore: 8 + (i % 3),
    scoreRating: 1,
    totalScore: 8 + (i % 3),
    tags: [],
    yellowCards: [],
    redCard: null,
  }));

const makeCompetitor = (
  position: number,
): StageEventClassificationItemResponseDTO => ({
  country: { id: "ES", name: "Spain" },
  dog: { id: `dog-${position}`, name: `Dog ${position}` },
  // Vary the exercise count so cards have genuinely different heights — this
  // is what tripped up the old estimate-based virtualizer (wrong order, gaps).
  exercises: makeExercises(4 + (position % 5)),
  owner: `Owner ${position}`,
  handler: `Handler ${position}`,
  position,
  scoreRating: 1,
  status: "COMPLETED",
  team: `Team ${position}`,
  totalScore: 300 - position,
  tied: false,
  startOrder: position,
  bih: false,
  awards: position <= 3 ? [{ id: "caciob", name: "CACIOB" }] : [],
});

const manyCompetitors: StageEventClassificationResponseDTO = {
  event: { id: "evt-1", name: "Qualification 1" },
  competitionName: "Qualifications",
  discipline: { id: "disc-1", name: "OBDX" },
  stage: { id: "stage-1", name: "Qualifications" },
  configuration: { id: "config-1", name: "FCI Grade 3" },
  lastUpdated: 1_730_050_000_000,
  status: "COMPLETED",
  obdx: {
    scoreCalculation: "AVG",
    judges: [{ id: "judge-1", name: "Maria Lopez" }],
    competitors: Array.from({ length: 12 }, (_, i) => makeCompetitor(i + 1)),
  },
};

loggedOutTest.describe("Classification list view - ordering", () => {
  loggedOutTest(
    "renders every competitor in position order with no overlap or gaps",
    async ({ page }) => {
      await setRouteResponses(page, {
        method: "GET",
        payload: manyCompetitors,
        pathname: "/events/*/classification",
      });

      await page.goto("/stages/stage-1/events/evt-1/classification");

      await expect(page.getByRole("radio", { name: "List" })).toBeChecked();
      await expect(
        page.locator(".obdx-clf__list .obdx-clf__position").first(),
      ).toBeVisible();

      const result = await page.evaluate(() => {
        const list = document.querySelector<HTMLElement>(".obdx-clf__list");
        if (!list) return { error: "no .obdx-clf__list" };
        const positions = Array.from(
          list.querySelectorAll<HTMLElement>(".obdx-clf__position"),
        ).map((el) => (el.textContent ?? "").replace("=", "").trim());
        const cards = Array.from(list.children);
        const issues: string[] = [];
        for (let i = 1; i < cards.length; i++) {
          const prev = cards[i - 1].getBoundingClientRect();
          const cur = cards[i].getBoundingClientRect();
          const gap = cur.top - prev.bottom;
          if (gap < -2) issues.push(`overlap@${i}:${Math.round(gap)}`);
          if (gap > 40) issues.push(`gap@${i}:${Math.round(gap)}`);
        }
        return { positions, issues, cardCount: cards.length };
      });

      expect(result.error).toBeUndefined();
      expect(result.cardCount).toBe(12);
      expect(result.positions).toEqual(
        Array.from({ length: 12 }, (_, i) => `#${i + 1}`),
      );
      expect(result.issues).toEqual([]);
    },
  );
});
