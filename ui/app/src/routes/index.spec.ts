import { expect } from "@playwright/test";
import { test } from "@test/utils/testFixture";

test("Visits the app root url", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "-Login" })).toBeVisible();
});
