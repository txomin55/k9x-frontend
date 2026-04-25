import { getCurrentLocale } from "@/stores/i18n";
import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import type {
  GetStageResponse,
  StageSummary,
} from "@/services/fetch-stages/fetchStages.types";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

const STAGES_SNAPSHOT_ID = "stages";
const STAGE_SNAPSHOT_PREFIX = "stage:";

export const getStagesQueryKey = () => ["stages", getCurrentLocale()] as const;
export const getStageByIdQueryKey = (id: string) =>
  ["stage", id, getCurrentLocale()] as const;

const getStageSnapshotId = (id: string) => `${STAGE_SNAPSHOT_PREFIX}${id}`;

const fetchStages = () =>
  fetchWithOfflineSnapshot(STAGES_SNAPSHOT_ID, () =>
    rawRequest<StageSummary[]>({
      path: "/stages",
    }),
  );

const refreshStageByIdSnapshot = async (id: string) => {
  const stage = await rawRequest<GetStageResponse>({
    path: `/stages/${id}`,
  });

  queryClient.setQueryData(getStageByIdQueryKey(id), stage);

  return stage;
};

export const fetchStageById = (id: string) =>
  fetchWithOfflineSnapshot(getStageSnapshotId(id), () =>
    refreshStageByIdSnapshot(id),
  );

const stagesQuery = defineQuery({
  fetcher: fetchStages,
  queryKey: ["stages"] as const,
});

const stageByIdQuery = defineQuery({
  fetcher: fetchStageById,
  queryKey: (id: string) => ["stage", id] as const,
});

export const useStages = (options?: TanstackCreateQuery) =>
  stagesQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });

export const useStageById = (id: string, options?: TanstackCreateQuery) =>
  stageByIdQuery.useQuery([id], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });
