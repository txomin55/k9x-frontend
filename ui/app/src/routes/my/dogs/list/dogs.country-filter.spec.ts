import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("My dogs - country filter", () => {
  competitorTest(
    "asks the API for the dogs of the chosen country",
    async ({ page }) => {
      const countries: string[] = [];
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.pathname.endsWith("/secured/dogs") && url.searchParams.has("country")) {
          countries.push(url.searchParams.get("country") as string);
        }
      });

      await page.goto("/my/dogs/list");
      await expect(page.getByText("Luna", { exact: true })).toBeVisible({
        timeout: 15000,
      });

      await page.getByRole("button", { name: /Country/ }).click();
      await page.getByRole("option", { name: "Portugal" }).click();

      // Both mock dogs are Spanish, so filtering by Portugal empties the list.
      await expect
        .poll(() => countries)
        .toContain("pt");
      await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);

      await page.getByRole("button", { name: /Country/ }).click();
      await page.getByRole("option", { name: "All countries" }).click();
      await expect(page.getByText("Luna", { exact: true })).toBeVisible();
    },
  );
});
