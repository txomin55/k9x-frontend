import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";
import { defaultStages } from "@test/api-mocks/stages";

const [latestStage] = defaultStages;

loggedOutTest.describe("Landing page - logged out", () => {
  loggedOutTest("shows the login action", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  loggedOutTest("opens a stage from the latest trials", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await page.getByRole("link", { name: latestStage.name }).click();

    await expect(page).toHaveURL(`/stages/${latestStage.id}/info`);
  });

  loggedOutTest(
    "expands the menu and navigates to trials",
    async ({ page }) => {
      await page.goto(AppRoutePath.HOME);

      await page.locator(".app-layout__navigation-toggle").click();
      await page.getByRole("link", { name: "Trials", exact: true }).click();

      await expect(page).toHaveURL("/stages");
    },
  );
});
