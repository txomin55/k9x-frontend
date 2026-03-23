import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";

const STAGES_ENDPOINT_PATH = "/stages";

export interface Stage {
  country: string;
  dateFrom: number;
  dateTo: number;
  description: string;
  grades: Grade[];
  id: string;
  location: Location;
  name: string;
}

export interface Grade {
  competitors: number;
  id: string;
  name: string;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

type TanstackCreateQuery = {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
};

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
