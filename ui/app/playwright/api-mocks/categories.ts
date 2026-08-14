import type { Page } from "@playwright/test";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

/**
 * Ids must match `ObdxEventCategory` on the backend: the editor seeds a draft with `CLUB`, so that entry has
 * to resolve or the select renders its placeholder on an event that does carry a category.
 */
export const defaultCategories: IdNameDTO[] = [
  { id: "CLUB", name: "Club" },
  { id: "OPEN", name: "Open" },
  { id: "WC_Q", name: "WC qualifier" },
  { id: "WC_SEMI", name: "WC semi-final" },
  { id: "WC_FINAL", name: "WC final" },
];

export const setupCategories = (page: Page, categories = defaultCategories) =>
  setRouteResponses(page, {
    method: "GET",
    payload: () => categories,
    pathname: "/secured/discipline/*/categories",
  });
