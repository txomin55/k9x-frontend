import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";

organizerTest.describe("My judges - country filter", () => {
  organizerTest(
    "asks the API for the judges of the chosen country",
    async ({ page }) => {
      const countries: string[] = [];
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (
          url.pathname.endsWith("/secured/judges") &&
          url.searchParams.has("country")
        ) {
          countries.push(url.searchParams.get("country") as string);
        }
      });

      await page.goto("/my/judges/list");
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible({
        timeout: 15000,
      });

      await page.getByRole("button", { name: /Country/ }).click();
      await page.getByRole("option", { name: "Portugal" }).click();

      await expect.poll(() => countries).toContain("pt");
      // Judge Alpha is Spanish, Judge Beta Portuguese.
      await expect(page.getByText("Judge Alpha", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Judge Beta", { exact: true })).toBeVisible();
    },
  );
});
