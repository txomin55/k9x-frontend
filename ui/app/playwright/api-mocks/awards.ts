import type { Page } from "@playwright/test";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const defaultAwards: IdNameDTO[] = [
  { id: "caciob", name: "CACIOB" },
  { id: "rcaciob", name: "RCACIOB" },
  { id: "cacob", name: "CACOB" },
  { id: "rcacob", name: "RCACOB" },
];

export const setupAwards = (page: Page, awards = defaultAwards) =>
  setRouteResponses(page, {
    method: "GET",
    payload: () => awards,
    pathname: "/secured/discipline/*/awards",
  });
