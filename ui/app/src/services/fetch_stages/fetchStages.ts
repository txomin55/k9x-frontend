import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { CompetitionLocation } from "@/services/fetch_competitions/fetchCompetitions";

const fetchStages = () =>
  rawRequest<Stage[]>({
    path: "/stages",
  });

const stagesQuery = defineQuery({
  fetcher: fetchStages,
  queryKey: ["stages"] as const,
});

export const useStages = (options?: TanstackCreateQuery) =>
  stagesQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });

export interface Stage {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEvent[];
  id: string;
  location?: CompetitionLocation;
  name: string;
}

export interface StageEvent {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}
