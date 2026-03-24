import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { CompetitionLocation } from "@/services/fetch_competitions/fetchCompetitions";

const STAGES_ENDPOINT_PATH = "/stages";

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

const fetchStages = () =>
  rawRequest<Stage[]>({
    path: STAGES_ENDPOINT_PATH,
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
