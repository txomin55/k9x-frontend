import type { Page } from "@playwright/test";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const defaultCountries: IdNameDTO[] = [
  { id: "es", name: "Spain" },
  { id: "pt", name: "Portugal" },
  { id: "fr", name: "France" },
  { id: "it", name: "Italy" },
  { id: "gb", name: "United Kingdom" },
];

export const setupCountries = (page: Page, countries = defaultCountries) =>
  setRouteResponses(page, {
    method: "GET",
    payload: countries,
    pathname: "/secured/countries",
  });
