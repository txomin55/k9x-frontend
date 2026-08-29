import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";

organizerTest.describe("My competitions - country filter", () => {
  organizerTest(
    "asks the API for the competitions of the chosen country",
    async ({ page }) => {
      const countries: string[] = [];
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (
          url.pathname.endsWith("/secured/competitions") &&
          url.searchParams.has("country")
        ) {
          countries.push(url.searchParams.get("country") as string);
        }
      });

      await page.goto("/my/competitions/list");
      await expect(
        page.getByText("Barcelona Spring Trial", { exact: true }),
      ).toBeVisible({ timeout: 15000 });

      await page.getByRole("button", { name: /Country/ }).click();
      await page.getByRole("option", { name: "France" }).click();

      // Both mock competitions are Spanish, so filtering by France empties the list.
      await expect.poll(() => countries).toContain("fr");
      await expect(page.getByText("No results match the filter.")).toBeVisible();

      await page.getByRole("button", { name: /Country/ }).click();
      await page.getByRole("option", { name: "Spain" }).click();
      await expect(
        page.getByText("Barcelona Spring Trial", { exact: true }),
      ).toBeVisible();
    },
  );
});
