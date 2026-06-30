import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { setupDogsCrud } from "@test/api-mocks/dogs";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

competitorTest.describe("My dogs (write) - competitor", () => {
  competitorTest(
    "creates a dog optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupDogsCrud(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/secured/dogs" },
        entityType: "dog",
        performMutation: async () => {
          await page.getByRole("button", { name: "+", exact: true }).click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Name").fill("Rex");
          await dialog.getByRole("button", { name: "Country" }).click();
          await page.keyboard.type("Spain");
          await page.keyboard.press("Enter");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Rex", { exact: true })).toBeVisible();
        },
      });
    },
  );

  competitorTest(
    "edits a dog optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupDogsCrud(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/dogs/" },
        entityType: "dog",
        performMutation: async () => {
          await page
            .getByRole("article")
            .filter({ hasText: "Luna" })
            .getByRole("button", { name: "Edit" })
            .click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Name").fill("Luna Edited");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Luna Edited", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  competitorTest(
    "deletes a dog optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupDogsCrud(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "DELETE", urlIncludes: "/secured/dogs/" },
        entityType: "dog",
        performMutation: async () => {
          await page
            .getByRole("article")
            .filter({ hasText: "Luna" })
            .getByRole("button", { name: "Delete" })
            .first()
            .click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);
        },
      });
    },
  );
});
