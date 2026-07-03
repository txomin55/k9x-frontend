import type { Page } from "@playwright/test";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const defaultBreeds: IdNameDTO[] = [
  { id: "border-collie", name: "Border Collie" },
  { id: "labrador", name: "Labrador" },
  { id: "swd", name: "Spanish Waterdog" },
  { id: "belgian-malinois", name: "Belgian Shepherd Malinois" },
  { id: "golden-retriever", name: "Golden Retriever" },
];

export const setupBreeds = (page: Page, breeds = defaultBreeds) =>
  setRouteResponses(page, {
    method: "GET",
    payload: breeds,
    pathname: "/secured/breeds",
  });
