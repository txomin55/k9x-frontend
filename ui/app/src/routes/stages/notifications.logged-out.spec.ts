import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";
import { defaultStages } from "@test/api-mocks/stages";

const [stage] = defaultStages;

loggedOutTest.describe("Trial notifications - logged out", () => {
  loggedOutTest(
    "asks to log in from the bell of a trial card",
    async ({ page }) => {
      await page.goto(AppRoutePath.STAGES);

      const card = page
        .getByRole("article")
        .filter({ hasText: stage.name })
        .first();

      await card.getByRole("button", { name: "Enable notifications" }).click();

      await expect(page.getByText("Log in to get notifications")).toBeVisible();
    },
  );
});
