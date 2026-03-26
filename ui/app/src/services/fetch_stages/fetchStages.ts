import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import type { Stage } from "@/services/fetch_stages/fetchStages.types";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

export type { Stage, StageEvent } from "@/services/fetch_stages/fetchStages.types";

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
