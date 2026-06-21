import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("Floating share button - logged in", () => {
  competitorTest("is visible for logged-in users", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
  });
});
