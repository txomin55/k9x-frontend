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
import type { Page } from "@playwright/test";

const EVENT_DETAIL_URL = `/my/competitions/${EVENT_DETAIL_COMPETITION_ID}/stages/${EVENT_DETAIL_STAGE_ID}/events/${EVENT_DETAIL_ID}`;

// Open the competitor editor once online so the dogs query (used by the dog
// combobox) is cached before a later step goes offline, then close it.
const warmDogOptions = async (page: Page) => {
  await page.getByRole("button", { name: "Add competitor" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Dog" }).click();
  // The dog option label is "Koda (Carlos Competitor)", so match by substring.
  await expect(
    page.locator(".atom-combobox__listbox").getByText("Koda"),
  ).toBeVisible({ timeout: 15000 });
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
};

organizerTest.describe("Event detail competitors (write) - organizer", () => {
  organizerTest(
    "adds a competitor optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);
      await page.getByRole("tab", { name: "Competitors" }).click();
      // The fixed floating toggle button overlaps the lower card actions and
      // intercepts pointer events; neutralize it (the toggle is not needed again).
      await page.addStyleTag({
        content: ".floating-toggle-circle { pointer-events: none; }",
      });
      await expect(page.getByText("Dog: Luna", { exact: true })).toBeVisible();
      await warmDogOptions(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page.getByRole("button", { name: "Add competitor" }).click();
          const dialog = page.getByRole("dialog");
          const dog = dialog.getByRole("combobox", { name: "Dog" });
          await dog.click();
          await dog.fill("Koda");
          await page
            .locator(".atom-combobox__listbox")
            .getByText("Koda")
            .click();
          await expect(dog).toHaveValue(/Koda/);
          await dialog.getByRole("button", { name: "Create" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Dog: Koda", { exact: true })).toBeVisible();
        },
        assertRehydrated: async () => {
          await page.getByRole("tab", { name: "Competitors" }).click();
          await expect(page.getByText("Dog: Koda", { exact: true })).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "edits a competitor's dog optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);
      await page.getByRole("tab", { name: "Competitors" }).click();
      // The fixed floating toggle button overlaps the lower card actions and
      // intercepts pointer events; neutralize it (the toggle is not needed again).
      await page.addStyleTag({
        content: ".floating-toggle-circle { pointer-events: none; }",
      });
      await expect(page.getByText("Dog: Luna", { exact: true })).toBeVisible();
      await warmDogOptions(page);

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/secured/obdx/events/" },
        entityType: "event",
        performMutation: async () => {
          await page
            .getByRole("button", { name: "Edit", exact: true })
            .click();
          const dialog = page.getByRole("dialog");
          const dog = dialog.getByRole("combobox", { name: "Dog" });
          await dog.click();
          await dog.fill("Koda");
          await page
            .locator(".atom-combobox__listbox")
            .getByText("Koda")
            .click();
          await expect(dog).toHaveValue(/Koda/);
          await dialog.getByRole("button", { name: "Close" }).click();
        },
        assertOptimistic: async () => {
          await expect(page.getByText("Dog: Koda", { exact: true })).toBeVisible();
        },
        assertRehydrated: async () => {
          await page.getByRole("tab", { name: "Competitors" }).click();
          await expect(page.getByText("Dog: Koda", { exact: true })).toBeVisible();
        },
      });
    },
  );

  organizerTest(
    "marks a competitor as did not show, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);
      await page.getByRole("tab", { name: "Competitors" }).click();
      // The fixed floating toggle button overlaps the lower card actions and
      // intercepts pointer events; neutralize it (the toggle is not needed again).
      await page.addStyleTag({
        content: ".floating-toggle-circle { pointer-events: none; }",
      });
      await expect(
        page.getByRole("button", { name: "Disqualify" }).first(),
      ).toBeVisible();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/not-competing" },
        entityType: "event",
        performMutation: async () => {
          await page
            .getByRole("button", { name: "Disqualify" })
            .first()
            .click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        },
        assertOptimistic: async () => {
          await expect(
            page.getByRole("button", { name: "Disqualify" }),
          ).toHaveCount(0);
        },
        assertRehydrated: async () => {
          await openEditMode(page);
          await page.getByRole("tab", { name: "Competitors" }).click();
          await expect(page.getByText("Dog: Luna", { exact: true })).toBeVisible();
          await expect(
            page.getByRole("button", { name: "Disqualify" }),
          ).toHaveCount(0);
        },
      });
    },
  );

  organizerTest(
    "opens a competitor's scores from view mode", async ({ page }) => {
      await setupEventDetailCrud(page);
      await page.goto(EVENT_DETAIL_URL);
      // The fixed floating toggle button overlaps the lower card actions and
      // intercepts pointer events; neutralize it.
      await page.addStyleTag({
        content: ".floating-toggle-circle { pointer-events: none; }",
      });
      await page.getByRole("tab", { name: "Competitors" }).click();
      await expect(page.getByText("Dog: Luna", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Scores" }).click();

      await expect(page).toHaveURL(/\/my\/collections\/event-detail-1/);
    },
  );

  organizerTest(
    "deletes a competitor optimistically, queues it offline, and rehydrates on reload",
    async ({ page, context }) => {
      await setupEventDetailCrud(page, { eventStatus: "CREATED" });
      await page.goto(EVENT_DETAIL_URL);
      await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
      await openEditMode(page);
      await page.getByRole("tab", { name: "Competitors" }).click();
      // The fixed floating toggle button overlaps the lower card actions and
      // intercepts pointer events; neutralize it (the toggle is not needed again).
      await page.addStyleTag({
        content: ".floating-toggle-circle { pointer-events: none; }",
      });
      await expect(page.getByText("Dog: Luna", { exact: true })).toBeVisible();

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
            page.getByText("Dog: Luna", { exact: true }),
          ).toHaveCount(0);
        },
        assertRehydrated: async () => {
          await page.getByRole("tab", { name: "Competitors" }).click();
          await expect(
            page.getByText("Dog: Luna", { exact: true }),
          ).toHaveCount(0);
        },
      });
    },
  );
});
