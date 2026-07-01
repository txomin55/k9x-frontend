import { expect } from "@playwright/test";
import { setupJudgesCrud } from "@test/api-mocks/judges";
import { organizerTest } from "@test/utils/authFixtures";

organizerTest.describe("My judges - name filter", () => {
	organizerTest("filters judges by a regex on their name", async ({ page }) => {
		await setupJudgesCrud(page);
		await page.goto("/my/judges/list");

		await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
		await expect(page.getByText("Judge Beta", { exact: true })).toBeVisible();

		const filter = page.getByLabel("Judge name");

		await filter.fill("^Judge A");
		await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
		await expect(page.getByText("Judge Beta", { exact: true })).toHaveCount(0);

		await filter.fill("bet");
		await expect(page.getByText("Judge Beta", { exact: true })).toBeVisible();
		await expect(page.getByText("Judge Alpha", { exact: true })).toHaveCount(0);

		await filter.fill("zzz");
		await expect(page.getByText("No results match the filter.")).toBeVisible();

		await filter.fill("");
		await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
		await expect(page.getByText("Judge Beta", { exact: true })).toBeVisible();
	});
});
