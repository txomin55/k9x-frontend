import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupCompetitionsCrud } from "@test/api-mocks/competitions";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";
import { openEditMode } from "@test/utils/detailEditMenu";

const STAGE_NOTIFICATIONS_URL =
  "/my/competitions/comp-with-event-1/stages/stage-with-event-1?tab=NOTIFICATIONS";

organizerTest.describe("Stage notifications - organizer", () => {
  organizerTest(
    "lists the sent notifications as cards and as a table",
    async ({ page }) => {
      await setupCompetitionsCrud(page);
      await page.goto(STAGE_NOTIFICATIONS_URL);

      await expect(
        page.getByText("Ring 1 starts one hour later").first(),
      ).toBeVisible();

      await page.getByText("Table", { exact: true }).click();
      await expect(page.getByRole("radio", { name: "Table" })).toBeChecked();
      await expect(
        page.getByRole("cell", { name: "Existing Event" }),
      ).toBeVisible();
    },
  );

  organizerTest(
    "keeps Notify disabled until an event and a long enough message are given",
    async ({ page }) => {
      await setupCompetitionsCrud(page);
      await page.goto(STAGE_NOTIFICATIONS_URL);

      await openEditMode(page);
      await page.getByRole("button", { name: "Add notification" }).click();

      const dialog = page.locator(".atom-dialog__content").last();
      const notify = dialog.getByRole("button", { name: "Notify" });
      await expect(notify).toBeDisabled();

      // Kobalte combobox options live in a portal, so pick by keyboard.
      await dialog.getByRole("button", { name: "Events" }).click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Escape");
      await expect(notify).toBeDisabled();

      const message = dialog.getByRole("textbox").last();
      await message.fill("short");
      await expect(notify).toBeDisabled();

      await message.fill("Ring 2 is delayed 30 min");
      await expect(notify).toBeEnabled();

      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText("Ring 2 is delayed 30 min")).toHaveCount(0);
    },
  );

  organizerTest(
    "sends a notification optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto(STAGE_NOTIFICATIONS_URL);
      await openEditMode(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/notifications" },
        entityType: "stage-notification",
        performMutation: async () => {
          await page.getByRole("button", { name: "Add notification" }).click();
          const dialog = page.locator(".atom-dialog__content").last();
          await dialog.getByRole("button", { name: "Events" }).click();
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");
          await page.keyboard.press("Escape");
          await dialog
            .getByRole("textbox")
            .last()
            .fill("Ring 2 is delayed 30 min");
          await dialog.getByRole("button", { name: "Notify" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Ring 2 is delayed 30 min").first(),
          ).toBeVisible();
        },
      });
    },
  );
});
