import type { Page } from "@playwright/test";

/**
 * A competitor with trials awaiting scores is greeted by a modal ("Pending collections") that overlays the
 * page and swallows clicks. It is not part of any write flow, so tests dismiss it before driving the page.
 */
const APPEARS_WITHIN = 5_000;

export const dismissPendingCollections = async (page: Page) => {
  const dialog = page.getByRole("dialog", { name: "Pending collections" });

  // It is raised by a query that resolves after first paint, so a plain visibility check races it.
  await dialog
    .waitFor({ state: "visible", timeout: APPEARS_WITHIN })
    .catch(() => undefined);

  if (!(await dialog.isVisible().catch(() => false))) return;

  await dialog.getByRole("button", { name: "Dismiss" }).click();
  await dialog.waitFor({ state: "hidden" });
};
