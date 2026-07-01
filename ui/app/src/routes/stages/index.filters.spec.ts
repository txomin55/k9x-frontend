import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { competitorTest, loggedOutTest } from "@test/utils/authFixtures";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";

const buildStage = (
	overrides: Partial<StageSummaryResponseDTO>,
): StageSummaryResponseDTO => ({
	id: "stage",
	name: "Stage",
	description: "",
	country: "ES",
	dateFrom: 0,
	dateTo: 0,
	status: "PUBLISHED",
	organizer: "K9 Club",
	location: { address: "", latitude: 0, longitude: 0 },
	events: [],
	...overrides,
});

const filterStages: StageSummaryResponseDTO[] = [
	buildStage({
		id: "stage-es",
		name: "Barcelona Spring Trial",
		country: "ES",
		dateFrom: Date.UTC(2024, 4, 1),
		dateTo: Date.UTC(2024, 4, 1),
		// Coordinates are spread across the globe so the map never clusters the
		// three markers, keeping each individually assertable by its label.
		location: { address: "Barcelona", latitude: 41.39, longitude: 2.17 },
	}),
	buildStage({
		id: "stage-pt",
		name: "Lisbon Winter Cup",
		country: "PT",
		dateFrom: Date.UTC(2024, 11, 1),
		dateTo: Date.UTC(2024, 11, 1),
		location: { address: "Sydney", latitude: -33.87, longitude: 151.21 },
	}),
	buildStage({
		id: "stage-fr",
		name: "Paris Autumn Open",
		country: "FR",
		dateFrom: Date.UTC(2024, 9, 15),
		dateTo: Date.UTC(2024, 9, 15),
		location: { address: "Lima", latitude: -12.05, longitude: -77.04 },
	}),
];

const setupFilterStages = (page: Page) =>
	setRouteResponses(page, {
		method: "GET",
		pathname: "/stages",
		payload: filterStages,
	});

const selectCountry = async (page: Page, country: string) => {
	await page.getByRole("button", { name: "Country" }).click();
	await page.keyboard.type(country);
	await page.keyboard.press("Enter");
};

competitorTest.describe("Trials list - filters (logged in)", () => {
	competitorTest("filters the trials by name", async ({ page }) => {
		await setupFilterStages(page);
		await page.goto(AppRoutePath.STAGES);

		await expect(
			page.getByText("Barcelona Spring Trial", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByText("Lisbon Winter Cup", { exact: true }),
		).toBeVisible();

		await page.getByLabel("Stage name").fill("^Lisbon");

		await expect(
			page.getByText("Lisbon Winter Cup", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByText("Barcelona Spring Trial", { exact: true }),
		).toHaveCount(0);
		await expect(
			page.getByText("Paris Autumn Open", { exact: true }),
		).toHaveCount(0);
	});

	competitorTest("filters the trials by country", async ({ page }) => {
		await setupFilterStages(page);
		await page.goto(AppRoutePath.STAGES);
		await expect(
			page.getByText("Paris Autumn Open", { exact: true }),
		).toBeVisible();

		await selectCountry(page, "France");

		await expect(
			page.getByText("Paris Autumn Open", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByText("Barcelona Spring Trial", { exact: true }),
		).toHaveCount(0);
		await expect(
			page.getByText("Lisbon Winter Cup", { exact: true }),
		).toHaveCount(0);
	});

	competitorTest("filters the trials by date range", async ({ page }) => {
		await setupFilterStages(page);
		await page.goto(AppRoutePath.STAGES);
		await expect(
			page.getByText("Lisbon Winter Cup", { exact: true }),
		).toBeVisible();

		await page.getByLabel("From date").fill("2024-11-01");
		await page.getByLabel("To date").fill("2024-12-31");

		await expect(
			page.getByText("Lisbon Winter Cup", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByText("Barcelona Spring Trial", { exact: true }),
		).toHaveCount(0);
		await expect(
			page.getByText("Paris Autumn Open", { exact: true }),
		).toHaveCount(0);
	});

	competitorTest(
		"keeps the map markers in sync with the filters",
		async ({ page }) => {
			await setupFilterStages(page);
			await page.goto(AppRoutePath.STAGES);

			await page.getByText("Map", { exact: true }).click();
			await expect(page.getByRole("radio", { name: "Map" })).toBeChecked();

			await expect(
				page.getByRole("img", { name: "Barcelona Spring Trial" }),
			).toBeVisible();
			await expect(
				page.getByRole("img", { name: "Lisbon Winter Cup" }),
			).toBeVisible();
			await expect(
				page.getByRole("img", { name: "Paris Autumn Open" }),
			).toBeVisible();

			await selectCountry(page, "France");

			await expect(
				page.getByRole("img", { name: "Paris Autumn Open" }),
			).toBeVisible();
			await expect(
				page.getByRole("img", { name: "Barcelona Spring Trial" }),
			).toHaveCount(0);
			await expect(
				page.getByRole("img", { name: "Lisbon Winter Cup" }),
			).toHaveCount(0);
		},
	);

	competitorTest(
		"applies the filters from the URL on first load",
		async ({ page }) => {
			await setupFilterStages(page);
			await page.goto(`${AppRoutePath.STAGES}?country=fr`);

			await expect(
				page.getByText("Paris Autumn Open", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toHaveCount(0);
			await expect(
				page.getByText("Lisbon Winter Cup", { exact: true }),
			).toHaveCount(0);
		},
	);

	competitorTest(
		"shows a no-results message when nothing matches",
		async ({ page }) => {
			await setupFilterStages(page);
			await page.goto(AppRoutePath.STAGES);
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toBeVisible();

			await page.getByLabel("Stage name").fill("zzz");

			await expect(
				page.getByText("No results match the filter."),
			).toBeVisible();
			await expect(
				page.getByText("Barcelona Spring Trial", { exact: true }),
			).toHaveCount(0);
		},
	);
});

loggedOutTest.describe("Trials list - filters (logged out)", () => {
	loggedOutTest("does not show the filters", async ({ page }) => {
		await page.goto(AppRoutePath.STAGES);
		await expect(page.getByText("Valencia Autumn Trial")).toBeVisible();

		await expect(page.getByLabel("Stage name")).toHaveCount(0);
		await expect(page.getByRole("button", { name: "Country" })).toHaveCount(0);
	});
});
