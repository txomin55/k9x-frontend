import type { Page } from "@playwright/test";

/**
 * The detail pages (competition, stage, event) gate their edit toggle behind a
 * floating "Options" (gear) menu: click the gear to reveal the pencil/edit
 * button, then the edit button itself. The gear menu stays open after toggling,
 * so the "View" button is reachable directly once editing.
 */
export const openEditMode = async (page: Page) => {
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
};
