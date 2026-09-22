import { expect } from "@playwright/test";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { loggedOutTest } from "@test/utils/authFixtures";
import { setupCrowdedCalendarStages } from "@test/api-mocks/stagesCalendar";

const OCTOBER_2024 = "from=1727740800000&to=1732924800000";
const CALENDAR_URL = `${AppRoutePath.STAGES}?view=CALENDAR&${OCTOBER_2024}`;

loggedOutTest.describe("Trials calendar", () => {
  loggedOutTest(
    "shows the trials of the selected range on their days",
    async ({ page }) => {
      await page.goto(CALENDAR_URL);

      await expect(page.getByRole("radio", { name: "Calendar" })).toBeChecked();
      await expect(page.getByText("October 2024")).toBeVisible();

      const day = page.getByRole("button", { name: "October 27, 2024" });
      await expect(day).toContainText("Valencia Autumn Trial");
      await expect(day.getByRole("img", { name: "es flag" })).toBeVisible();
    },
  );

  loggedOutTest("opens the trial detail from a day", async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.getByRole("button", { name: "October 27, 2024" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Valencia Autumn Trial");
    await expect(dialog.getByText("Agility Standard")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "+Info" })).toBeVisible();
  });

  loggedOutTest(
    "moves between the months covered by the range",
    async ({ page }) => {
      await page.goto(CALENDAR_URL);

      await expect(
        page.getByRole("button", { name: "Previous month" }),
      ).toBeDisabled();

      await page.getByRole("button", { name: "Next month" }).click();

      await expect(page.getByText("November 2024")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "October 27, 2024" }),
      ).toBeHidden();
    },
  );

  loggedOutTest(
    "caps the trials shown on a busy day and lists them all in the dialog",
    async ({ page }) => {
      await setupCrowdedCalendarStages(page);

      const from = Date.UTC(2026, 8, 1);
      const to = Date.UTC(2026, 8, 30);
      await page.goto(
        `${AppRoutePath.STAGES}?view=CALENDAR&from=${from}&to=${to}`,
      );

      const busyDay = page.getByRole("button", { name: "September 12, 2026" });
      await expect(busyDay).toContainText("8a Prova CN 2026");
      await expect(busyDay.getByText("+1", { exact: true })).toBeVisible();
      await expect(busyDay).not.toContainText("Europameisterschaft IGP");

      await busyDay.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toContainText("8a Prova CN 2026");
      await expect(dialog).toContainText("Ranking Lydnad Sverige");
      await expect(dialog).toContainText("Europameisterschaft IGP");
    },
  );
});
