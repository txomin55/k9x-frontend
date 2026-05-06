import { getCurrentLocale } from "@/stores/i18n/i18n";
import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import type {
  StageDetail,
  StageSummary,
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
    rawRequest<StageSummary[]>({
      path: "/stages",
    }),
  );

const refreshStageByIdSnapshot = async (id: string) => {
  const stage = await rawRequest<StageDetail>({
    path: `/stages/${id}`,
  });

  queryClient.setQueryData(getStageByIdQueryKey(id), stage);

  return stage;
};

export const fetchStageById = (id: string) =>
  fetchWithOfflineSnapshot(getStageSnapshotId(id), () =>
    refreshStageByIdSnapshot(id),
  );

/*
const fetchEventClassification = (stageId: string, eventId: string) =>
  rawRequest<StageEventClassificationItem[]>({
    path: `/stages/${stageId}/events/${eventId}/classification`,
  });
*/

const fetchEventClassification = (stageId: string, eventId: string) =>
  Promise.resolve([
    {
      country: "ES",
      dog: {
        id: "dog-001",
        name: "Nala",
      },
      exercises: [
        {
          exercise: {
            id: "ex-1",
            name: "Obediencia",
          },
          scores: [
            {
              judge: {
                id: "judge-1",
                name: "María López",
              },
              value: 9.5,
            },
            {
              judge: {
                id: "judge-2",
                name: "Carlos Ruiz",
              },
              value: 9.0,
            },
          ],
        },
      ],
      owner: "Ana Pérez",
      team: "K9 Madrid",
    },
    {
      country: "PT",
      dog: {
        id: "dog-002",
        name: "Rex",
      },
      exercises: [
        {
          exercise: {
            id: "ex-1",
            name: "Obediencia",
          },
          scores: [
            {
              judge: {
                id: "judge-1",
                name: "María López",
              },
              value: 8.7,
            },
          ],
        },
        {
          exercise: {
            id: "ex-2",
            name: "Salto",
          },
          scores: [
            {
              judge: {
                id: "judge-2",
                name: "Carlos Ruiz",
              },
              value: 9.2,
            },
          ],
        },
      ],
      owner: "João Silva",
      team: "Lisbon Dogs",
    },
  ]);

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
    refetchInterval: 5_000,
  });

export const getCachedStageById = (id: string) =>
  queryClient.getQueryData<StageDetail>(getStageByIdQueryKey(id)) ??
  queryClient
    .getQueryData<StageSummary[]>(getStagesQueryKey())
    ?.find((stage) => stage.id === id);

export const getCachedEventById = (stageId: string, eventId: string) =>
  getCachedStageById(stageId)?.events.find((event) => event.id === eventId);
