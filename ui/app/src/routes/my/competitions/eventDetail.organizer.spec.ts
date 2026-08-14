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

  organizerTest(
    "changes the event category and sends it on the update payload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);

      // The seeded event is OPEN, so a visible "Open" proves the category survives the round-trip
      // rather than the editor falling back to its CLUB default.
      await expect(page.getByText("Open", { exact: true })).toBeVisible();

      let updatePayload: Record<string, unknown> | null = null;
      page.on("request", (request) => {
        if (
          request.method() === "PUT" &&
          request.url().includes("/secured/obdx/events/")
        ) {
          updatePayload = request.postDataJSON();
        }
      });

      // The trigger is a button whose accessible name is the label plus the current value,
      // e.g. "Category Open" — the same shape as the Federation and Grade selects.
      const categorySelect = page.getByRole("button", { name: /^Category/ });

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await openEditMode(page);
          await categorySelect.click();
          await page.getByRole("option", { name: "WC final" }).click();
        },
        assertOptimistic: async () => {
          await expect(categorySelect).toContainText("WC final");
        },
        // The reload lands back in view mode, where the category is plain text, not a select.
        assertRehydrated: async () => {
          await expect(
            page.getByText("WC final", { exact: true }),
          ).toBeVisible();
        },
      });

      // The backend rejects an update with no category, so the id has to travel on every write.
      expect(updatePayload).toMatchObject({ category: "WC_FINAL" });
    },
  );
});
