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

      // The locale toggle is now a select; open it and pick the Spanish option.
      await page.locator('button[aria-haspopup="listbox"]').click();
      await page.getByRole("option", { name: "es" }).click();
      await expect(
        page.getByText("¿Quieres ser organizador?"),
      ).toBeVisible();
    },
  );
});
