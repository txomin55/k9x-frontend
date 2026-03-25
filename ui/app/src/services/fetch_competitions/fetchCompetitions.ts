import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { CompetitionLocation } from "@/services/competition_crud/competitionCrud";

const fetchCompetitions = () =>
  rawRequest<Competitions[]>({
    path: "/api/competitions",
  });

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
