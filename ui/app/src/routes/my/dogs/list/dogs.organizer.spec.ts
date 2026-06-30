import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupDogsCrud } from "@test/api-mocks/dogs";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

organizerTest.describe("My dogs (write) - organizer", () => {
  organizerTest(
    "creates a dog without marking it as owned, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupDogsCrud(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      let createPayload: Record<string, unknown> | null = null;
      page.on("request", (request) => {
        if (
          request.method() === "POST" &&
          request.url().includes("/secured/dogs")
        ) {
          createPayload = request.postDataJSON();
        }
      });

      const ownedCheckbox = page.getByRole("checkbox", { name: "Owned" });

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "POST", urlIncludes: "/secured/dogs" },
        entityType: "dog",
        performMutation: async () => {
          await page.getByRole("button", { name: "+", exact: true }).click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Name").fill("Rex");
          await dialog.getByLabel("Owner").fill("Olivia Organizer");
          await expect(ownedCheckbox).not.toBeChecked();
          await dialog.getByRole("button", { name: "Country" }).click();
          await page.keyboard.type("Spain");
          await page.keyboard.press("Enter");
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Rex", { exact: true })).toBeVisible();
        },
      });

      expect(createPayload).toMatchObject({ name: "Rex" });
      expect(createPayload).not.toHaveProperty("owned");
    },
  );

  organizerTest(
    "edits a dog and unmarks it as owned, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupDogsCrud(page);
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      let updatePayload: Record<string, unknown> | null = null;
      page.on("request", (request) => {
        if (
          request.method() === "PUT" &&
          request.url().includes("/secured/dogs/")
        ) {
          updatePayload = request.postDataJSON();
        }
      });

      const ownedCheckbox = page.getByRole("checkbox", { name: "Owned" });

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
          await expect(ownedCheckbox).toBeChecked();
          await dialog.getByText("Owned", { exact: true }).click();
          await expect(ownedCheckbox).not.toBeChecked();
          await dialog.getByRole("button", { name: "Save" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Luna Edited", { exact: true }),
          ).toBeVisible();
        },
      });

      expect(updatePayload).toMatchObject({ name: "Luna Edited" });
      expect(updatePayload).not.toHaveProperty("owned");
    },
  );

  organizerTest(
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
