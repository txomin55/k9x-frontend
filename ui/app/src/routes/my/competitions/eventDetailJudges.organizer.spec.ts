import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import {
  EVENT_DETAIL_COMPETITION_ID,
  EVENT_DETAIL_ID,
  EVENT_DETAIL_STAGE_ID,
  setupEventDetailCrud,
} from "@test/api-mocks/eventDetail";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";
import { openEditMode } from "@test/utils/detailEditMenu";

const EVENT_DETAIL_URL = `/my/competitions/${EVENT_DETAIL_COMPETITION_ID}/stages/${EVENT_DETAIL_STAGE_ID}/events/${EVENT_DETAIL_ID}`;

organizerTest.describe("Event detail judges (write) - organizer", () => {
  organizerTest(
    "adds a judge optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Add judge" }).click();
          const dialog = page.getByRole("dialog");
          const judge = dialog.getByRole("combobox", { name: "Judge" });
          await judge.click();
          await judge.fill("Judge Beta");
          await judge.press("ArrowDown");
          await judge.press("Enter");
          await dialog.getByLabel("Email").fill("beta@k9x.test");
          await dialog.getByRole("button", { name: "Create" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Judge Beta", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits a judge email optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(
        page.getByText("Email: alpha@k9x.test", { exact: true }),
      ).toBeVisible();
      await openEditMode(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          // The judge card's "Edit" trigger is a span (not a button).
          await page.getByText("Edit", { exact: true }).click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Email").fill("edited@k9x.test");
          await dialog.getByLabel("Email").blur();
          await dialog.getByRole("button", { name: "Close" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Email: edited@k9x.test", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  /**
   * The domain rejects a second main judge, so the dialog must not let the organizer create one: with Alpha
   * already flagged, the checkbox is blocked and says who holds it.
   */
  organizerTest(
    "blocks marking a second main judge while another judge holds it",
    async ({ page }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      // Judge Alpha is the seeded main judge, so the badge starts on its card.
      await expect(
        page.locator(".card", { hasText: "Judge Alpha" }).getByText("Main judge"),
      ).toBeVisible();
      await openEditMode(page);

      await page.getByRole("button", { name: "Add judge" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByLabel("Main judge")).toBeDisabled();
      await expect(
        dialog.getByText("Judge Alpha is already the main judge", {
          exact: false,
        }),
      ).toBeVisible();
    },
  );

  organizerTest(
    "moves the main judge flag once the previous one is cleared, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);

      // Free the main-judge box first: the checkbox for anybody else stays blocked until Alpha releases it.
      // The judge card's "Edit" trigger is a span (not a button).
      await page.getByText("Edit", { exact: true }).click();
      const alphaDialog = page.getByRole("dialog");
      // Kobalte keeps the native checkbox input visually hidden, so the label is what can be clicked.
      await alphaDialog.getByText("Main judge", { exact: true }).click();
      await alphaDialog.getByRole("button", { name: "Close" }).click();
      await expect(
        page.locator(".card", { hasText: "Judge Alpha" }).getByText("Main judge"),
      ).toHaveCount(0);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Add judge" }).click();
          const dialog = page.getByRole("dialog");
          const judge = dialog.getByRole("combobox", { name: "Judge" });
          await judge.click();
          await judge.fill("Judge Beta");
          await judge.press("ArrowDown");
          await judge.press("Enter");
          await dialog.getByText("Main judge", { exact: true }).click();
          await dialog.getByRole("button", { name: "Create" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.locator(".card", { hasText: "Judge Beta" }).getByText("Main judge"),
          ).toBeVisible();
          await expect(
            page.locator(".card", { hasText: "Judge Alpha" }).getByText("Main judge"),
          ).toHaveCount(0);
        },
      });
    },
  );

  organizerTest(
    "deletes a judge optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page
            .getByRole("button", { name: "Delete", exact: true })
            .first()
            .click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("Judge Alpha", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
