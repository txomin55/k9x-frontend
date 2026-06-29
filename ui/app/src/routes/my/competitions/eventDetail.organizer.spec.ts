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

organizerTest.describe("Event detail (write) - organizer", () => {
  organizerTest(
    "edits the event name from the event detail page, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(
        page.getByRole("heading", { name: "Detail Event" }),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Edit" }).click();
          await page
            .getByLabel("Event title")
            .fill("Detail Event Edited");
          // Commit on blur, then return to view mode to read the <h1> bound to
          // the (optimistically updated) event cache.
          await page.getByLabel("Event title").blur();
          await page.getByRole("button", { name: "View" }).click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByRole("heading", { name: "Detail Event Edited" }),
          ).toBeVisible();
        },
      });
    },
  );
});
