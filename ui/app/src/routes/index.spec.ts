import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/app_shell/paths";
import { test } from "@test/utils/testFixture";

test("Visits the app root url", async ({ page }) => {
  await page.goto(AppRoutePath.HOME);

  await expect(page.getByRole("button", { name: "-Login" })).toBeVisible();
});
