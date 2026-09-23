import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";
import { defaultStages } from "@test/api-mocks/stages";
import { defaultExtractionLog } from "@test/api-mocks/extractions";

const [latestStage] = defaultStages;

loggedOutTest.describe("Landing page - logged out", () => {
  loggedOutTest("shows the login action", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  loggedOutTest("opens a stage from the latest trials", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await page.getByRole("link", { name: latestStage.name }).click();

    await expect(page).toHaveURL(`/stages/${latestStage.id}/info`);
  });

  loggedOutTest(
    "lists imported trials by day with only the latest day open",
    async ({ page }) => {
      const [latestDay, olderDay] = defaultExtractionLog;
      const latestStage = latestDay.stages[0];
      const olderStage = olderDay.stages[0];

      await page.goto(AppRoutePath.HOME);
      await page.getByRole("button", { name: "See imports" }).click();

      const dialog = page.getByRole("dialog");
      await expect(
        dialog.getByRole("link", { name: new RegExp(latestStage.name) }),
      ).toBeVisible();
      await expect(dialog.getByText(latestStage.events[0].name)).toBeVisible();
      await expect(dialog.getByText(olderStage.name)).not.toBeVisible();
      await expect(dialog.getByRole("button", { name: /enroll/i })).toHaveCount(
        0,
      );

      await dialog
        .getByRole("link", { name: new RegExp(latestStage.name) })
        .click();

      await expect(page).toHaveURL(`/stages/${latestStage.id}/info`);
    },
  );

  loggedOutTest("explains what K9X is", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    await expect(
      page.getByText("Canine competitions, in one place"),
    ).toBeVisible();
    await expect(page.getByText("What is K9X?", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Enroll in trials", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("More features with an account")).toBeVisible();
  });

  loggedOutTest("expands and collapses a FAQ answer", async ({ page }) => {
    await page.goto(AppRoutePath.HOME);

    const question = page.getByRole("button", {
      name: "Does it work offline?",
    });
    const answer = page.getByText("K9X is built local-first", { exact: false });

    await question.click();
    await expect(answer).toBeVisible();

    await question.click();
    await expect(answer).not.toBeVisible();
  });

  loggedOutTest(
    "expands the menu and navigates to trials",
    async ({ page }) => {
      await page.goto(AppRoutePath.HOME);

      await page.locator(".app-layout__navigation-toggle").click();
      await page.getByRole("link", { name: "Trials", exact: true }).click();

      await expect(page).toHaveURL("/stages");
    },
  );
});
