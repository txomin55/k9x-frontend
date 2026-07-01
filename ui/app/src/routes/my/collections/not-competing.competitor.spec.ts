import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupCollectionNotCompeting } from "@test/api-mocks/collections";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

competitorTest.describe("Collection not-competing (write) - collector", () => {
  competitorTest(
    "marks a competitor as did not show, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCollectionNotCompeting(page);

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

      const didNotShowButton = page
        .getByRole("button", { name: "Did not show" })
        .first();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/not-competing" },
        entityType: "event",
        performMutation: async () => {
          await selectCompetitor();
          await didNotShowButton.click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(didNotShowButton).toBeHidden();
        },
        assertRehydrated: async () => {
          await selectCompetitor();
          await expect(didNotShowButton).toBeHidden();
        },
      });
    },
  );
});
