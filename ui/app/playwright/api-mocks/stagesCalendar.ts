import type { Page } from "@playwright/test";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

const day = (isoDate: string) => new Date(`${isoDate}T09:00:00Z`).getTime();

const stage = (
  id: string,
  name: string,
  country: string,
  from: string,
  to = from,
): StageSummaryResponseDTO => ({
  id,
  name,
  competitionName: "Calendar competition",
  country,
  dateFrom: day(from),
  dateTo: day(to),
  status: "PUBLISHED",
  organizer: "Calendar club",
  location: { address: "Somewhere", latitude: 40, longitude: -3 },
  events: [],
});

/** Three trials on 2026-09-12, one of them spanning into the 13th. */
export const crowdedDayStages: StageSummaryResponseDTO[] = [
  stage("calendar-pt", "8a Prova CN 2026", "pt", "2026-09-12"),
  stage(
    "calendar-se",
    "Ranking Lydnad Sverige",
    "se",
    "2026-09-12",
    "2026-09-13",
  ),
  stage("calendar-de", "Europameisterschaft IGP", "de", "2026-09-12"),
];

export const setupCrowdedCalendarStages = (page: Page) =>
  setRouteResponses(page, {
    method: "GET",
    pathname: "/stages",
    payload: crowdedDayStages,
  });
