import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n/i18n";
import { createMemo, getOwner } from "solid-js";
import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import {
  applyCompetitionRemoval,
  applyCompetitionUpsert,
  commitCompetitionMutation,
  commitCompetitionMutationSuccess,
  createCompetitionRollbackPayload,
  getVisibleCompetitions
} from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import type {
  CompetitionResponseDTO,
  UpdateCompetitionRequestDTO
} from "@/services/secured/competition-crud/competitionCrud.types";
import type { CompetitionStageDetailResponseDTO } from "@/services/secured/stage-crud/stageCrud.types";
import {
  normalizeEventDetailResponse,
  type EventDetailResponseDTO,
} from "@/services/secured/event-crud/eventCrud.types";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { mergeCompetitionsWithDrafts } from "@/services/secured/competition-crud/competitionDraftStore";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";

const DRAFT_COMPETITION_STATUS = "draft";
const hydratedCompetitionEventsIds = new Set<string>();

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

const refreshCompetitionsSnapshot = async () => {
  const competitions = await rawRequest<CompetitionResponseDTO[]>({
    path: "/secured/competitions",
  });

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions);
  queryClient.setQueryData(getCompetitionsQueryKey(), competitions);

  return competitions;
};

const fetchCompetitions = () =>
  fetchWithOfflineSnapshot(
    COMPETITIONS_SNAPSHOT_ID,
    refreshCompetitionsSnapshot,
  );

const competitionsQuery = defineQuery({
  fetcher: fetchCompetitions,
  queryKey: ["competitions"] as const,
});

const createCompetitionsQuery = (options?: TanstackCreateQuery) =>
  competitionsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

export const prefetchCompetitions = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = competitionsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useCompetitions = (options?: TanstackCreateQuery) => {
  const competitions = createCompetitionsQuery(options);
  const mergedData = createMemo(() =>
    mergeCompetitionsWithDrafts(competitions.data),
  );

  return new Proxy(competitions, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergedData();
      }

      return Reflect.get(target, property, receiver);
    },
  });
};

const mergeCompetitionWithPayload = (
  payload: IdNameDTO | UpdateCompetitionRequestDTO,
  previousCompetition?: CompetitionResponseDTO,
): CompetitionResponseDTO => {
  const payloadId = "id" in payload ? payload.id : undefined;
  const country =
    "country" in payload
      ? payload.country
      : (previousCompetition?.country ?? "");
  const description =
    "description" in payload
      ? payload.description
      : previousCompetition?.description;
  const address =
    "address" in payload ? payload.address : previousCompetition?.address;

  return {
    country,
    description,
    id: payloadId ?? previousCompetition?.id ?? globalThis.crypto.randomUUID(),
    address: address ?? previousCompetition?.address ?? "",
    name: payload.name ?? previousCompetition?.name ?? "",
    notifications: previousCompetition?.notifications,
    stages: previousCompetition?.stages,
    status: previousCompetition?.status ?? DRAFT_COMPETITION_STATUS,
  };
};

const createDefaultCompetition = (): IdNameDTO => ({
  id: globalThis.crypto.randomUUID(),
  name: "--Default competition",
});

export const getCachedCompetitions = () =>
  mergeCompetitionsWithDrafts(
    queryClient.getQueryData<CompetitionResponseDTO[]>(
      getCompetitionsQueryKey(),
    ),
  );

export const hydrateCompetitionStages = async (competitionId: string) => {
  const stages = await rawRequest<CompetitionStageDetailResponseDTO[]>({
    path: `/secured/competitions/${competitionId}/stages`,
  });

  let nextCompetitions: CompetitionResponseDTO[] = [];

  queryClient.setQueryData<CompetitionResponseDTO[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) => {
      const competitions = previousCompetitions ?? [];

      nextCompetitions = competitions.map((competition) =>
        competition.id === competitionId ? { ...competition, stages } : competition,
      );

      return nextCompetitions;
    },
  );

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, nextCompetitions);

  return stages;
};

export const hydrateCompetitionEvents = async (
  competitionId: string,
  stageIds: string[],
) => {
  if (stageIds.length === 0) {
    hydratedCompetitionEventsIds.add(competitionId);
    return [] as EventDetailResponseDTO[];
  }

  const normalizedStageIds = stageIds.map((id) => String(id));
  const normalizedStageIdsSet = new Set(normalizedStageIds);
  const query = new URLSearchParams();
  normalizedStageIds.forEach((id) => query.append("ids", id));
  const rawEvents = await rawRequest<EventDetailResponseDTO[]>({
    path: `/secured/competitions/${competitionId}/stages/events?${query.toString()}`,
  });
  const events = rawEvents.map((event) => normalizeEventDetailResponse(event));

  const eventsByStageId = new Map<string, EventDetailResponseDTO[]>();
  events.forEach((event) => {
    const stageId = event.stage?.id ? String(event.stage.id) : "";

    if (!stageId) return;
    const current = eventsByStageId.get(stageId) ?? [];
    current.push(event);
    eventsByStageId.set(stageId, current);
  });

  let nextCompetitions: CompetitionResponseDTO[] = [];

  queryClient.setQueryData<CompetitionResponseDTO[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) => {
      const competitions = previousCompetitions ?? [];

      nextCompetitions = competitions.map((competition) => {
        if (competition.id !== competitionId || !competition.stages) {
          return competition;
        }

        return {
          ...competition,
          stages: competition.stages.map((stage) =>
            normalizedStageIdsSet.has(String(stage.id))
              ? { ...stage, events: eventsByStageId.get(String(stage.id)) ?? [] }
              : stage,
          ),
        };
      });

      return nextCompetitions;
    },
  );

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, nextCompetitions);
  hydratedCompetitionEventsIds.add(competitionId);

  return events;
};

export const hasHydratedCompetitionEvents = (competitionId: string) =>
  hydratedCompetitionEventsIds.has(competitionId);

export const useCompetition = () => {
  const getCompetitions = (options?: TanstackCreateQuery) =>
    useCompetitions(options);

  const getCompetition = (id: string) => {
    if (!getOwner()) {
      return () =>
        getCachedCompetitions()?.find((competition) => competition.id === id);
    }

    const competitionsQuery = createCompetitionsQuery({
      staleTime: Number.POSITIVE_INFINITY,
    });

    return createMemo(() =>
      mergeCompetitionsWithDrafts(competitionsQuery.data).find(
        (competition) => competition.id === id,
      ),
    );
  };

  const createCompetition = (payload: IdNameDTO) => {
    const previousCompetitionsFromCache = getCachedCompetitions();
    const draftCompetition = mergeCompetitionWithPayload(payload);

    applyCompetitionUpsert(draftCompetition);

    void (async () => {
      await commitCompetitionMutation({
        entityId: draftCompetition.id,
        method: "POST",
        payload,
        onCommitted: () =>
          commitCompetitionMutationSuccess({
            entityId: draftCompetition.id,
            method: "POST",
            payload: draftCompetition,
          }),
        rollbackPayload: await createCompetitionRollbackPayload(
          draftCompetition.id,
          null,
          previousCompetitionsFromCache,
        ),
        url: "/secured/competitions",
      });
    })();
  };

  const updateCompetition = (
    id: string,
    payload: UpdateCompetitionRequestDTO,
  ) => {
    const previousCompetitionsFromCache = getVisibleCompetitions();
    const previousCompetition =
      previousCompetitionsFromCache.find(
        (competition) => competition.id === id,
      ) ?? undefined;

    if (!previousCompetition) {
      throw new Error(
        `updateCompetition requires an existing competition ${id}`,
      );
    }

    const nextCompetition = mergeCompetitionWithPayload(
      { ...payload, id },
      previousCompetition,
    );

    applyCompetitionUpsert(nextCompetition);

    void (async () => {
      await commitCompetitionMutation({
        entityId: id,
        method: "PUT",
        payload,
        onCommitted: () =>
          commitCompetitionMutationSuccess({
            entityId: id,
            method: "PUT",
          }),
        rollbackPayload: await createCompetitionRollbackPayload(
          id,
          previousCompetition ?? null,
          previousCompetitionsFromCache,
        ),
        url: `/secured/competitions/${id}`,
      });
    })();
  };

  const deleteCompetition = (id: string) => {
    const previousCompetitionsFromCache = getCachedCompetitions();
    const previousCompetition =
      previousCompetitionsFromCache?.find(
        (competition) => competition.id === id,
      ) ?? undefined;

    applyCompetitionRemoval(id);

    void (async () => {
      await commitCompetitionMutation({
        entityId: id,
        method: "DELETE",
        onCommitted: () =>
          commitCompetitionMutationSuccess({
            entityId: id,
            method: "DELETE",
          }),
        rollbackPayload: await createCompetitionRollbackPayload(
          id,
          previousCompetition ?? null,
          previousCompetitionsFromCache,
        ),
        url: `/secured/competitions/${id}`,
      });
    })();
  };

  return {
    getCompetition,
    getCompetitions,
    createCompetition,
    deleteCompetition,
    updateCompetition,
    createDefaultCompetition,
  };
};
