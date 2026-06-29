import { expect } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import {
  EVENT_DETAIL_COMPETITION_ID,
  EVENT_DETAIL_ID,
  EVENT_DETAIL_STAGE_ID,
  setupEventDetailCrud,
} from "@test/api-mocks/eventDetail";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

const EVENT_DETAIL_URL = `/my/competitions/${EVENT_DETAIL_COMPETITION_ID}/stages/${EVENT_DETAIL_STAGE_ID}/events/${EVENT_DETAIL_ID}`;

organizerTest.describe("Event detail exercises (write) - organizer", () => {
  organizerTest(
    "adds an exercise optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByRole("tab", { name: "Exercises" }).click();
      await expect(page.getByText("Heel work", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "+", exact: true }).click();
          const dialog = page.getByRole("dialog");
          const exercise = dialog.getByRole("combobox", { name: "Exercise" });
          await exercise.click();
          await exercise.fill("Recall");
          // Combobox options are virtualized; wait for the filtered option to
          // render before navigating, otherwise the keypress races the list.
          await expect(
            page.locator(".atom-combobox__listbox").getByText("Recall"),
          ).toBeVisible();
          await exercise.press("ArrowDown");
          await exercise.press("Enter");
          await dialog.getByRole("button", { name: "Create" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Recall", { exact: true })).toBeVisible();
        },
        assertRehydrated: async () => {
          // A reload resets AtomTabs to its default (Judges) tab.
          await page.getByRole("tab", { name: "Exercises" }).click();
          await expect(page.getByText("Recall", { exact: true })).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits an exercise's tags optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByRole("tab", { name: "Exercises" }).click();
      await expect(page.getByText("Heel work", { exact: true })).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByText("Edit", { exact: true }).click();
          const dialog = page.getByRole("dialog");
          await dialog.getByLabel("Tags").fill("edited-tag");
          await dialog.getByLabel("Tags").blur();
          await dialog.getByRole("button", { name: "Close" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByText("edited-tag", { exact: true }),
          ).toBeVisible();
        },
        assertRehydrated: async () => {
          await page.getByRole("tab", { name: "Exercises" }).click();
          await expect(
            page.getByText("edited-tag", { exact: true }),
          ).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "deletes an exercise optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByRole("tab", { name: "Exercises" }).click();
      await expect(page.getByText("Heel work", { exact: true })).toBeVisible();

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
            page.getByText("Heel work", { exact: true }),
          ).toHaveCount(0);
        },
        assertRehydrated: async () => {
          await page.getByRole("tab", { name: "Exercises" }).click();
          await expect(
            page.getByText("Heel work", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
