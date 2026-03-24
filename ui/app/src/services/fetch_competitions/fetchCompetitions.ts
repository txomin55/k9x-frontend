import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";

const COMPETITIONS_ENDPOINT_PATH = "/api/competitions";

export interface Competitions {
  country: string;
  description: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  stages: CompetitionStage[];
  status: string;
}

export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompetitionStage {
  dateFrom: number;
  dateTo: number;
  id: string;
  name: string;
}

const fetchCompetitions = () =>
  rawRequest<Competitions[]>({
    path: COMPETITIONS_ENDPOINT_PATH,
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
