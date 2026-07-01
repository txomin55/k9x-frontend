import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";

organizerTest.describe("My competitions - name filter", () => {
	organizerTest(
		"filters competitions by a regex on their name",
		async ({ page }) => {
			await page.goto("/my/competitions/list");

			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("Madrid Summer Cup", { exact: true }),
			).toBeVisible();

			const filter = page.getByLabel("Competition name");

			await filter.fill("^Madrid");
			await expect(
				page.getByText("Madrid Summer Cup", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toHaveCount(0);

			await filter.fill("barcelona");
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("Madrid Summer Cup", { exact: true }),
			).toHaveCount(0);

			await filter.fill("zzz");
			await expect(
				page.getByText("No results match the filter."),
			).toBeVisible();

			await filter.fill("");
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("Madrid Summer Cup", { exact: true }),
			).toBeVisible();
		},
	);
});
