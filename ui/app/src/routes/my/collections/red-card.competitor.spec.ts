import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupCollectionRedCard } from "@test/api-mocks/collections";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

competitorTest.describe("Collection red card (write) - collector", () => {
  competitorTest(
    "registers a red card with the collector's own judge, queues it offline, and flushes on reconnect",
    async ({ page, context }) => {
      await setupCollectionRedCard(page);

      await page.goto("/my/collections/list");
      await page.getByRole("button", { name: "Collect", exact: true }).click();

      const redCardButton = page
        .getByRole("button", { name: "Red card" })
        .first();
      await expect(redCardButton).toBeVisible();
      const dialog = page.getByRole("dialog");

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/red-card" },
        entityType: "red-card",
        performMutation: async () => {
          await page.getByRole("button", { name: "Competitors" }).click();
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");

          await redCardButton.click();

          await dialog.getByRole("button", { name: "Exercise" }).click();
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");

          await dialog
            .getByRole("button", { name: "Register", exact: true })
            .click();
        },
        assertOptimistic: async () => {
          await expect(dialog).toBeHidden();
        },
        assertRehydrated: async () => {
          await expect(redCardButton).toBeVisible();
        },
      });
    },
  );
});
