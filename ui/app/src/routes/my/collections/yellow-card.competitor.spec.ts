import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupCollectionYellowCard } from "@test/api-mocks/collections";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

competitorTest.describe("Collection yellow card (write) - collector", () => {
  competitorTest(
    "registers a yellow card with the collector's own judge, queues it offline, and flushes on reconnect",
    async ({ page, context }) => {
      await setupCollectionYellowCard(page);

      await page.goto("/my/collections/list");
      await page.getByRole("button", { name: "Collect", exact: true }).click();

      const yellowCardButton = page
        .getByRole("button", { name: "Yellow card" })
        .first();
      await expect(yellowCardButton).toBeVisible();
      const dialog = page.getByRole("dialog");

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/yellow-card" },
        entityType: "yellow-card",
        performMutation: async () => {
          await yellowCardButton.click();

          const pickFirstOption = async (selectLabel: string) => {
            await dialog.getByRole("button", { name: selectLabel }).click();
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
          };

          await pickFirstOption("Competitors");
          await pickFirstOption("Exercise");

          await dialog
            .getByRole("button", { name: "Register", exact: true })
            .click();
        },
        assertOptimistic: async () => {
          await expect(dialog).toBeHidden();
        },
        assertRehydrated: async () => {
          await expect(yellowCardButton).toBeVisible();
        },
      });
    },
  );
});
