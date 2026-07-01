import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";

competitorTest.describe("My dogs - name filter", () => {
	competitorTest("filters dogs by a regex on their name", async ({ page }) => {
		await page.goto("/my/dogs/list");

		await expect(page.getByText("Luna", { exact: true })).toBeVisible();
		await expect(page.getByText("Koda", { exact: true })).toBeVisible();

		const filter = page.getByLabel("Dog name");

		await filter.fill("^K");
		await expect(page.getByText("Koda", { exact: true })).toBeVisible();
		await expect(page.getByText("Luna", { exact: true })).toHaveCount(0);

		await filter.fill("una$");
		await expect(page.getByText("Luna", { exact: true })).toBeVisible();
		await expect(page.getByText("Koda", { exact: true })).toHaveCount(0);

		await filter.fill("zzz");
		await expect(page.getByText("No results match the filter.")).toBeVisible();

		await filter.fill("");
		await expect(page.getByText("Luna", { exact: true })).toBeVisible();
		await expect(page.getByText("Koda", { exact: true })).toBeVisible();
	});
});
