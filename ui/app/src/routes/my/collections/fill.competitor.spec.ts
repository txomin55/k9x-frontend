import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupCollectionScoring } from "@test/api-mocks/collections";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";
import { dismissPendingCollections } from "@test/utils/pendingCollectionsDialog";

competitorTest.describe("Collection scoring (write) - competitor", () => {
  competitorTest(
    "fills a competitor's score for a single judge, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCollectionScoring(page);

      await page.goto("/my/collections/list");
      await dismissPendingCollections(page);
      await page.getByRole("button", { name: "Collect", exact: true }).click();
      // The collector page has no heading of its own; its competitor picker is what marks it ready.
      await expect(
        page.getByRole("button", { name: "Competitors" }),
      ).toBeVisible();

      const selectCompetitor = async () => {
        await page.getByRole("button", { name: "Competitors" }).click();
        await page.keyboard.type("Ana Perez");
        await page.keyboard.press("Enter");
      };

      const scoreInput = page.getByRole("spinbutton");

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/score" },
        entityType: "collection",
        performMutation: async () => {
          await selectCompetitor();
          // The judge header is abbreviated ("J. Alpha"); the score input is the real precondition.
          await expect(scoreInput).toBeVisible();
          await scoreInput.fill("8");
          await scoreInput.blur();
        },
        assertOptimistic: async () => {
          await expect(scoreInput).toHaveValue("8");
        },
        assertRehydrated: async () => {
          await selectCompetitor();
          await expect(scoreInput).toHaveValue("8");
        },
      });
    },
  );
});
