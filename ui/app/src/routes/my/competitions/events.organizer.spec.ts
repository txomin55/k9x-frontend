import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupCompetitionsCrud } from "@test/api-mocks/competitions";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

const STAGE_DETAIL_URL =
  "/my/competitions/comp-with-stage-1/stages/stage-existing-1";
const STAGE_WITH_EVENT_URL =
  "/my/competitions/comp-with-event-1/stages/stage-with-event-1";

organizerTest.describe("Stage events (write) - organizer", () => {
  organizerTest(
    "creates an event optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto(STAGE_DETAIL_URL);
      await expect(
        page.getByRole("heading", { name: "Existing Trial" }),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/secured/events" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Edit" }).click();
          await page
            .getByRole("button", { name: "+", exact: true })
            .first()
            .click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Event title").fill("Obedience Open");
          // Kobalte Select listbox is virtualized and inside a modal, so options
          // are not exposed as ARIA options; select by keyboard.
          await dialog.getByRole("button", { name: "Discipline" }).click();
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Obedience Open", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits an event optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      // Open the event editor via its search param: the per-event "Edit" trigger
      // sits under the fixed floating toggle button. The open modal makes the
      // rest of the page aria-hidden, so scope to the dialog with CSS locators.
      await page.goto(`${STAGE_WITH_EVENT_URL}?event=event-existing-1`);
      const dialog = page.locator(".atom-dialog__content").last();
      const titleField = dialog.getByLabel("Event title");
      await expect(titleField).toHaveValue("Existing Event");

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await titleField.fill("Existing Event Edited");
          await dialog.locator("button", { hasText: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Existing Event Edited", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "deletes an event optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto(STAGE_WITH_EVENT_URL);
      await expect(
        page.getByText("Existing Event", { exact: true }),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "DELETE", urlIncludes: "/secured/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Edit" }).click();
          await page
            .getByRole("button", { name: "Delete", exact: true })
            .first()
            .click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Existing Event", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
