import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("My dogs - name filter", () => {
  competitorTest(
    "asks the API for the dogs whose name contains the text",
    async ({ page }) => {
      await page.goto("/my/dogs/list");

      await expect(page.getByText("Luna", { exact: true })).toBeVisible();
      await expect(page.getByText("Koda", { exact: true })).toBeVisible();

      const filter = page.getByLabel("Dog name");

      await filter.fill("kod");
      await expect(page.getByText("Koda", { exact: true })).toBeVisible();
      await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);

      await filter.fill("una");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();
      await expect(page.getByText("Koda", { exact: true })).toHaveCount(0);

      await filter.fill("zzz");
      await expect(
        page.getByText("No results match the filter."),
      ).toBeVisible();

      await filter.fill("");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();
      await expect(page.getByText("Koda", { exact: true })).toBeVisible();
    },
  );

  competitorTest(
    "leaves the list alone until the text is worth searching for",
    async ({ page }) => {
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      // Two characters narrow down nothing, so the list stays as it was.
      await page.getByLabel("Dog name").fill("ko");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();
      await expect(page.getByText("Koda", { exact: true })).toBeVisible();

      await page.getByLabel("Dog name").fill("kod");
      await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Koda", { exact: true })).toBeVisible();
    },
  );

  competitorTest(
    "keeps the caret in the search box while the results are replaced",
    async ({ page }) => {
      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();

      const filter = page.getByLabel("Dog name");
      await filter.click();
      await filter.pressSequentially("koda", { delay: 100 });

      await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);
      await expect(filter).toBeFocused();
      await expect(filter).toHaveValue("koda");
    },
  );
});
