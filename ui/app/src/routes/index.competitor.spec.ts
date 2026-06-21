import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("Landing page - competitor", () => {
  competitorTest(
    "requests organizer access and toggles theme and language from the user menu",
    async ({ page }) => {
      await page.goto(AppRoutePath.HOME);

      await expect(
        page.getByText("Want to be organizer?"),
      ).toBeVisible();

      await page.getByRole("button", { name: "Carlos Competitor" }).click();

      await page.getByRole("button", { name: "Dark", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Light", exact: true }),
      ).toBeVisible();

      await page.getByRole("button", { name: "es", exact: true }).click();
      await expect(
        page.getByText("¿Quieres ser organizador?"),
      ).toBeVisible();
    },
  );
});
