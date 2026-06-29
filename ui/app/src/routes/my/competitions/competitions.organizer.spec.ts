import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import { setupCompetitionsCrud } from "@test/api-mocks/competitions";
import { trackRequests, verifyLocalFirstWrite } from "@test/utils/localFirst";

organizerTest.describe("My competitions (write) - organizer", () => {
  organizerTest(
    "creates a competition optimistically and posts it to the server",
    async ({ page }) => {
      await setupCompetitionsCrud(page);
      await page.goto("/my/competitions/list");
      await expect(
        page.getByText("Barcelona Spring Trial", { exact: true }),
      ).toBeVisible();

      const posts = trackRequests(page, {
        method: "POST",
        urlIncludes: "/secured/competitions",
      });

      await page.getByRole("button", { name: "+", exact: true }).click();

      await expect(
        page.getByRole("link", { name: "Default competition" }),
      ).toBeVisible();
      await expect.poll(() => posts.length).toBeGreaterThan(0);

      await page.reload();
      await expect(
        page.getByText("Default competition", { exact: true }),
      ).toBeVisible();
    },
  );

  organizerTest(
    "edits a competition optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupCompetitionsCrud(page);
      await page.goto("/my/competitions/comp-created-1");
      await expect(
        page.getByText("Madrid Summer Cup", { exact: true }),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/competitions/" },
        entityType: "competition",
        performMutation: async () => {
          await page.getByRole("button", { name: "Edit" }).click();
          await page.getByLabel("Title").fill("Madrid Summer Cup Edited");
          await page.getByLabel("Description").click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByRole("link", { name: "Madrid Summer Cup Edited" }),
          ).toBeVisible();
        },
        assertRehydrated: async () => {
          await expect(
            page.getByText("Madrid Summer Cup Edited", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "deletes a competition optimistically and removes it on the server",
    async ({ page }) => {
      await setupCompetitionsCrud(page);
      await page.goto("/my/competitions/comp-deletable-1");
      await expect(
        page.getByText("Valencia Winter Cup", { exact: true }),
      ).toBeVisible();

      const deletes = trackRequests(page, {
        method: "DELETE",
        urlIncludes: "/secured/competitions/",
      });

      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByRole("button", { name: "Delete" }).first().click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete" })
        .click();

      await expect(page).toHaveURL("/my/competitions/list");
      await expect(
        page.getByText("Valencia Winter Cup", { exact: true }),
      ).toHaveCount(0);
      await expect.poll(() => deletes.length).toBeGreaterThan(0);

      await page.reload();
      await expect(
        page.getByText("Valencia Winter Cup", { exact: true }),
      ).toHaveCount(0);
    },
  );
});
