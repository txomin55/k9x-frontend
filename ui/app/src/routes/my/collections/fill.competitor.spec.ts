import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupCollectionScoring } from "@test/api-mocks/collections";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

competitorTest.describe("Collection scoring (write) - competitor", () => {
  competitorTest(
    "fills a competitor's score for a single judge, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCollectionScoring(page);

      await page.goto("/my/collections/list");
      await page.getByRole("button", { name: "Collect", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Score collector" }),
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
          await expect(page.getByText("Judge Alpha")).toBeVisible();
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
