import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { getQuerySnapshot, saveQuerySnapshot } from "@/services/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { CompetitionLocation } from "@/services/competition_crud/competitionCrud";

export type { CompetitionLocation };

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

const getCompetitionsQueryKey = () =>
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
  const snapshot = await getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID);

  if (snapshot) {
    if (globalThis.navigator.onLine) {
      void refreshCompetitionsSnapshot().catch(() => undefined);
    }

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
    refetchOnMount: options?.refetchOnMount,
  });

export interface Competitions {
  country: string;
  description: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  stages: CompetitionStage[];
  status: string;
}

export interface CompetitionStage {
  dateFrom: number;
  dateTo: number;
  id: string;
  name: string;
}
