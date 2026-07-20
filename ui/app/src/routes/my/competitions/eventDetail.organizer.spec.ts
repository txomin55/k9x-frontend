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

organizerTest.describe("Event detail (write) - organizer", () => {
  organizerTest(
    "edits the event name from the event detail page, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(
        page.getByText("Detail Event", { exact: true }).first(),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await openEditMode(page);
          await page
            .getByLabel("Event title")
            .fill("Detail Event Edited");
          // Commit on blur; the breadcrumb link reads the (optimistically
          // updated) event cache, so it reflects the edit without leaving edit mode.
          await page.getByLabel("Event title").blur();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByRole("link", { name: "Detail Event Edited" }),
          ).toBeVisible();
        },
      });
    },
  );
});
