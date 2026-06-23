import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupJudgesCrud } from "@test/api-mocks/judges";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

organizerTest.describe("My judges (write) - organizer", () => {
  organizerTest(
    "creates a judge optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupJudgesCrud(page);
      await page.goto("/my/judges/list");
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/secured/judges" },
        entityType: "judge",
        performMutation: async () => {
          await page.getByRole("button", { name: "+", exact: true }).click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Name").fill("Judge Mike");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Judge Mike", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits a judge optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupJudgesCrud(page);
      await page.goto("/my/judges/list");
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/judges/" },
        entityType: "judge",
        performMutation: async () => {
          await page
            .getByRole("article")
            .filter({ hasText: "Judge Alpha" })
            .getByRole("button", { name: "Edit" })
            .click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Name").fill("Judge Alpha Edited");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Judge Alpha Edited", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "deletes a judge optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupJudgesCrud(page);
      await page.goto("/my/judges/list");
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "DELETE", urlIncludes: "/secured/judges/" },
        entityType: "judge",
        performMutation: async () => {
          await page
            .getByRole("article")
            .filter({ hasText: "Judge Alpha" })
            .getByRole("button", { name: "Delete" })
            .first()
            .click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Judge Alpha", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
