import type { Page } from "@playwright/test";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import type { RankingResponseDTO } from "@/services/secured/ranking-crud/rankingCrud.types";
import { RANKING_INCLUDE_BY, RANKING_GROUP_BY } from "@/utils/ranking";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const defaultRankingGroupBys: IdNameDTO[] = [
  { id: RANKING_GROUP_BY.INDIVIDUAL, name: "Individual" },
  { id: RANKING_GROUP_BY.TEAM, name: "Team" },
  { id: RANKING_GROUP_BY.COUNTRY, name: "Country" },
];

export const defaultRankingIncludeBys: IdNameDTO[] = [
  { id: RANKING_INCLUDE_BY.HIGHEST, name: "Best results" },
  { id: RANKING_INCLUDE_BY.LOWEST, name: "Worst results" },
  { id: RANKING_INCLUDE_BY.ALL, name: "Every result" },
];

export const setupRankingCriteria = (page: Page) =>
  Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: defaultRankingGroupBys,
      pathname: "/secured/rankings/group-bys",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultRankingIncludeBys,
      pathname: "/secured/rankings/include-bys",
    }),
  ]);

/**
 * A competition has no ranking by default, which the endpoint reports as 204.
 */
export const setupNoRanking = (page: Page) =>
  setRouteResponses(page, {
    method: "GET",
    payload: "",
    pathname: "/secured/rankings/*",
    status: 204,
  });

export const setupRanking = (page: Page, ranking: RankingResponseDTO) =>
  setRouteResponses(page, {
    method: "GET",
    payload: ranking,
    pathname: "/secured/rankings/*",
  });

export const setupSaveRanking = (page: Page) =>
  setRouteResponses(page, {
    method: "POST",
    payload: "",
    pathname: "/secured/rankings",
  });

export const setupDeleteRanking = (page: Page) =>
  setRouteResponses(page, {
    method: "DELETE",
    payload: "",
    pathname: "/secured/rankings/*",
  });
