import { defineQuery } from "@/utils/http/query-factory";
import {
  getQuerySnapshot,
  saveQuerySnapshot,
} from "@/services/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import type {
  CompetitionLocation,
  CompetitionStage,
  Competitions,
} from "@/services/fetch_competitions/fetchCompetitions.types";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

export type {
  CompetitionLocation,
  CompetitionStage,
  Competitions,
} from "@/services/fetch_competitions/fetchCompetitions.types";

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

const refreshCompetitionsSnapshot = async () => {
  const competitions = await rawRequest<Competitions[]>({
    path: "/api/competitions",
  });

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions);
  queryClient.setQueryData(getCompetitionsQueryKey(), competitions);

  return competitions;
};

const fetchCompetitions = async () => {
  const snapshot = await getQuerySnapshot<Competitions[]>(
    COMPETITIONS_SNAPSHOT_ID,
  );

  if (snapshot) {
    return snapshot;
  }

  return refreshCompetitionsSnapshot();
};

const competitionsQuery = defineQuery({
  fetcher: fetchCompetitions,
  queryKey: ["competitions"] as const,
});

export const useCompetitions = (options?: TanstackCreateQuery) =>
  competitionsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });
