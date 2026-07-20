import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupCompetitionsCrud } from "@test/api-mocks/competitions";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";
import { openEditMode } from "@test/utils/detailEditMenu";

organizerTest.describe("Competition stages (write) - organizer", () => {
  organizerTest(
    "creates a stage optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto("/my/competitions/comp-created-1");
      await expect(
        page.getByText("Madrid Summer Cup", { exact: true }).first(),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/secured/stages" },
        entityType: "stage",
        performMutation: async () => {
          await openEditMode(page);
          await page
            .getByRole("button", { name: "Add trial" })
            .first()
            .click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Trial title").fill("Day One");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Day One", { exact: true })).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits a stage optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      // Open the stage editor via its search param: the per-stage "Edit" trigger
      // sits under the fixed floating toggle button, which intercepts clicks.
      // The open modal makes the rest of the page aria-hidden, so we scope to the
      // dialog content with CSS locators instead of role queries.
      await page.goto(
        "/my/competitions/comp-with-stage-1?stageDialog=stage-existing-1",
      );
      const dialog = page.locator(".atom-dialog__content").last();
      const titleField = dialog.getByLabel("Trial title");
      await expect(titleField).toHaveValue("Existing Trial");

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/stages/" },
        entityType: "stage",
        performMutation: async () => {
          await titleField.fill("Existing Trial Edited");
          await dialog.locator("button", { hasText: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Existing Trial Edited", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "deletes a stage optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto("/my/competitions/comp-with-stage-1");
      await expect(
        page.getByText("Existing Trial", { exact: true }).first(),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "DELETE", urlIncludes: "/secured/stages/" },
        entityType: "stage",
        performMutation: async () => {
          await openEditMode(page);
          await page.getByRole("button", { name: "Delete" }).first().click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Existing Trial", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
