import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";

loggedOutTest.describe("Floating share button - logged out", () => {
  loggedOutTest("is hidden for anonymous users", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share" })).toBeHidden();
  });
});
