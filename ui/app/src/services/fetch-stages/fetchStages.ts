import { getCurrentLocale } from "@/stores/i18n/i18n";
import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { EVENT_STATUS } from "@/utils/event";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import {
  StageDetailResponseDTO,
  StageEventClassificationResponseDTO,
  StageSummaryResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

const STAGES_SNAPSHOT_ID = "stages";
const STAGE_SNAPSHOT_PREFIX = "stage:";

export const getStagesQueryKey = () => ["stages", getCurrentLocale()] as const;
export const getStageByIdQueryKey = (id: string) =>
  ["stage", id, getCurrentLocale()] as const;
export const getEventClassificationQueryKey = (
  stageId: string,
  eventId: string,
) =>
  ["stage-event-classification", stageId, eventId, getCurrentLocale()] as const;

const getStageSnapshotId = (id: string) => `${STAGE_SNAPSHOT_PREFIX}${id}`;

const fetchStages = () =>
  fetchWithOfflineSnapshot(STAGES_SNAPSHOT_ID, () =>
    rawRequest<StageSummaryResponseDTO[]>({
      path: "/stages",
    }),
  );

const refreshStageByIdSnapshot = async (id: string) => {
  const stage = await rawRequest<StageDetailResponseDTO>({
    path: `/stages/${id}`,
  });

  queryClient.setQueryData(getStageByIdQueryKey(id), stage);

  return stage;
};

export const fetchStageById = (id: string) =>
  fetchWithOfflineSnapshot(getStageSnapshotId(id), () =>
    refreshStageByIdSnapshot(id),
  );

const fetchEventClassification = (stageId: string, eventId: string) =>
  rawRequest<StageEventClassificationResponseDTO>({
    path: `/events/${eventId}/classification`,
  });

const stagesQuery = defineQuery({
  fetcher: fetchStages,
  queryKey: ["stages"] as const,
});

const stageByIdQuery = defineQuery({
  fetcher: fetchStageById,
  queryKey: (id: string) => ["stage", id] as const,
});

const eventClassificationQuery = defineQuery({
  fetcher: fetchEventClassification,
  queryKey: (stageId: string, eventId: string) =>
    ["stage-event-classification", stageId, eventId] as const,
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

export const useEventClassification = (
  stageId: string,
  eventId: string,
  options?: TanstackCreateQuery,
) =>
  eventClassificationQuery.useQuery([stageId, eventId], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    refetchInterval: (query: { state: { data?: StageEventClassificationResponseDTO } }) =>
      query.state.data?.status === EVENT_STATUS.STARTED ? 5_000 : false,
  });

export const getCachedStageById = (id: string) =>
  queryClient.getQueryData<StageDetailResponseDTO>(getStageByIdQueryKey(id)) ??
  queryClient
    .getQueryData<StageSummaryResponseDTO[]>(getStagesQueryKey())
    ?.find((stage) => stage.id === id);

export const getCachedEventById = (stageId: string, eventId: string) =>
  getCachedStageById(stageId)?.events?.find((event) => event.id === eventId);

const getStageNameFromClassificationCache = (stageId: string) => {
  const entries = queryClient.getQueriesData<StageEventClassificationResponseDTO>(
    { queryKey: ["stage-event-classification", stageId] },
  );

  for (const [, data] of entries) {
    if (data?.stage?.name) return data.stage.name;
  }

  return undefined;
};

export const getCachedStageName = (id: string) =>
  getCachedStageById(id)?.name ?? getStageNameFromClassificationCache(id);

const getStageStatusFromSummaryCache = (id: string) =>
  queryClient
    .getQueryData<StageSummaryResponseDTO[]>(getStagesQueryKey())
    ?.find((stage) => stage.id === id)?.status;

export const getCachedStageStatus = (id: string) =>
  getCachedStageById(id)?.status ?? getStageStatusFromSummaryCache(id);

export const getCachedEventName = (stageId: string, eventId: string) =>
  getCachedEventById(stageId, eventId)?.name ??
  queryClient.getQueryData<StageEventClassificationResponseDTO>(
    getEventClassificationQueryKey(stageId, eventId),
  )?.event?.name;
