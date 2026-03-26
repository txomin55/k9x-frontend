import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import type { ApiStage } from "@/services/fetch_api_stages/fetchApiStages.types";

export type {
  ApiStage,
  ApiStageCompetitor,
  ApiStageEvent,
  ApiStageEventConfiguration,
  ApiStageEventScore,
  ApiStageExercise,
  ApiStageJudge,
} from "@/services/fetch_api_stages/fetchApiStages.types";

const fetchApiStage = (id: string) =>
  rawRequest<ApiStage>({
    path: `/api/stages/${id}`,
  });

const apiStageQuery = defineQuery({
  fetcher: fetchApiStage,
  queryKey: (id: string) => ["api-stage", id] as const,
});

export const useApiStage = (id: string, options?: TanstackCreateQuery) =>
  apiStageQuery.useQuery([id], {
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    staleTime: options?.staleTime,
  });
