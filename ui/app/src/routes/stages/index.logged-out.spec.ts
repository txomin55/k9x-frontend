import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";
import { defaultStages } from "@test/api-mocks/stages";

loggedOutTest.describe("Trials list - logged out", () => {
  loggedOutTest("shows the list of trials", async ({ page }) => {
    await page.goto(AppRoutePath.STAGES);

    for (const stage of defaultStages) {
      await expect(page.getByText(stage.name)).toBeVisible();
    }
  });

  loggedOutTest("switches between list, table and map views", async ({ page }) => {
    const [stage] = defaultStages;

    await page.goto(AppRoutePath.STAGES);
    await expect(page.getByText(stage.name)).toBeVisible();

    await page.getByText("Table", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Table" })).toBeChecked();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();

    await page.getByText("Map", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Map" })).toBeChecked();
    await expect(page.getByRole("table")).toBeHidden();
  });

  loggedOutTest(
    "opens the enrolled competitors of an event from a trial",
    async ({ page }) => {
      await page.goto(AppRoutePath.STAGES);

      await page
        .getByRole("article")
        .filter({ hasText: "Sevilla Summer Trial" })
        .getByRole("button", { name: "+ Info" })
        .click();

      await expect(
        page.getByText("Agility Standard", { exact: true }),
      ).toBeVisible();

      await page
        .getByRole("button", { name: "Competitors enrolled (2)" })
        .click();

      await expect(page.getByText("Rex (Border Collie)")).toBeVisible();
    },
  );

  loggedOutTest(
    "pins the second competitor in the classification and switches to the table view",
    async ({ page }) => {
      await page.goto(AppRoutePath.STAGES);

      await page
        .getByRole("article")
        .filter({ hasText: "Valencia Autumn Trial" })
        .getByRole("button", { name: "Classification" })
        .click();

      await expect(page.getByText("Rex")).toBeVisible();

      await page
        .getByRole("article")
        .filter({ hasText: "Luna" })
        .getByRole("button", { name: "Pin" })
        .click();

      await expect(
        page.getByRole("button", { name: "Unpin" }).first(),
      ).toBeVisible();

      await page.getByText("Table", { exact: true }).click();
      await expect(page.getByRole("radio", { name: "Table" })).toBeChecked();
      await expect(page.getByRole("table")).toBeVisible();
    },
  );
});
