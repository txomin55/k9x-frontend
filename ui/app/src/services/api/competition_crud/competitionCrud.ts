import {
  getQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local_first/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
import { createMemo } from "solid-js";
import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import {
  applyCompetitionRemoval,
  applyCompetitionUpsert,
  createCompetitionRollbackPayload,
  queueCompetitionMutation,
} from "@/services/api/competition_crud/competitionCrudOfflineUtils";
import type {
  Competition,
  CompetitionLocation,
  Competitions,
  PostCompetition,
  PostCompetitionStage,
  Stage,
} from "@/services/api/competition_crud/competitionCrudTypes";
import { queryClient } from "@/utils/http/query-client";

export type {
  CompetitionLocation,
  CompetitionStage,
  Competitions,
} from "@/services/api/competition_crud/competitionCrudTypes";

const DRAFT_COMPETITION_STATUS = "draft";

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

const refreshCompetitionsSnapshot = async () => {
  const competitions = await rawRequest<Competitions[]>({
    path: "/api/competitions",
  });

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions);
  queryClient.setQueryData(getCompetitionsQueryKey(), competitions);

  return competitions;
};

const fetchCompetitions = async () => {
  const snapshot = await getQuerySnapshot<Competitions[]>(
    COMPETITIONS_SNAPSHOT_ID,
  );

  if (snapshot) {
    return snapshot;
  }

  return refreshCompetitionsSnapshot();
};

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

export const useCompetitions = (options?: TanstackCreateQuery) =>
  createCompetitionsQuery(options);

const toCompetitionStage = (
  stage: PostCompetitionStage,
  previousStage?: Stage,
): Stage => ({
  dateFrom: stage.dateFrom ?? previousStage?.dateFrom ?? 0,
  dateTo: stage.dateTo ?? previousStage?.dateTo ?? 0,
  events: previousStage?.events ?? [],
  id: stage.id ?? previousStage?.id ?? globalThis.crypto.randomUUID(),
  name: stage.name ?? previousStage?.name ?? "",
});

const toCompetitionLocation = (
  location?: CompetitionLocation,
  previousLocation?: CompetitionLocation,
): CompetitionLocation | undefined => {
  if (!location && !previousLocation) return undefined;

  return {
    address: location?.address ?? previousLocation?.address,
    latitude: location?.latitude ?? previousLocation?.latitude,
    longitude: location?.longitude ?? previousLocation?.longitude,
  };
};

const mergeCompetitionWithPayload = (
  payload: PostCompetition,
  previousCompetition?: Competition,
): Competition => {
  const previousStagesById = new Map(
    (previousCompetition?.stages ?? []).map((stage) => [stage.id, stage]),
  );

  return {
    country: payload.country ?? previousCompetition?.country ?? "",
    description: payload.description ?? previousCompetition?.description,
    id: payload.id ?? previousCompetition?.id ?? globalThis.crypto.randomUUID(),
    location: toCompetitionLocation(
      payload.location,
      previousCompetition?.location,
    ),
    name: payload.name ?? previousCompetition?.name ?? "",
    notifications: previousCompetition?.notifications,
    stages:
      payload.stages?.map((stage) =>
        toCompetitionStage(
          stage,
          stage.id ? previousStagesById.get(stage.id) : undefined,
        ),
      ) ?? previousCompetition?.stages,
    status: previousCompetition?.status ?? DRAFT_COMPETITION_STATUS,
  };
};

const createDefaultCompetition = (): PostCompetition => ({
  country: "pt",
  id: globalThis.crypto.randomUUID(),
  name: "--Default competition",
});

export const getCachedCompetitions = () =>
  queryClient.getQueryData<Competitions[]>(getCompetitionsQueryKey());

export const useCompetition = () => {
  const getCompetitions = (options?: TanstackCreateQuery) =>
    createCompetitionsQuery(options);

  const getCompetition = (id: string) => {
    const competitionsQuery = createCompetitionsQuery({
      staleTime: Number.POSITIVE_INFINITY,
    });

    return createMemo(() =>
      competitionsQuery.data?.find((competition) => competition.id === id),
    );
  };

  const createCompetition = (payload: PostCompetition) => {
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsQueryKey());
    const draftCompetition = mergeCompetitionWithPayload(payload);

    applyCompetitionUpsert(draftCompetition);

    void (async () => {
      await queueCompetitionMutation({
        entityId: draftCompetition.id,
        method: "POST",
        payload,
        rollbackPayload: await createCompetitionRollbackPayload(
          draftCompetition.id,
          null,
          previousCompetitionsFromCache,
        ),
        url: "/api/competitions",
      });
    })();
  };

  const updateCompetition = (payload: PostCompetition) => {
    if (!payload.id) {
      throw new Error("updateCompetition requires an id");
    }

    const entityId = payload.id;
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsQueryKey());
    const previousCompetition =
      previousCompetitionsFromCache?.find(
        (competition) => competition.id === entityId,
      ) ?? undefined;
    const nextCompetition = mergeCompetitionWithPayload(
      payload,
      previousCompetition,
    );

    applyCompetitionUpsert(nextCompetition);

    void (async () => {
      await queueCompetitionMutation({
        entityId,
        method: "PUT",
        payload,
        rollbackPayload: await createCompetitionRollbackPayload(
          entityId,
          previousCompetition ?? null,
          previousCompetitionsFromCache,
        ),
        url: `/api/competitions/${entityId}`,
      });
    })();
  };

  const deleteCompetition = (id: string) => {
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsQueryKey());
    const previousCompetition =
      previousCompetitionsFromCache?.find(
        (competition) => competition.id === id,
      ) ?? undefined;

    applyCompetitionRemoval(id);

    void (async () => {
      await queueCompetitionMutation({
        entityId: id,
        method: "DELETE",
        rollbackPayload: await createCompetitionRollbackPayload(
          id,
          previousCompetition ?? null,
          previousCompetitionsFromCache,
        ),
        url: `/api/competitions/${id}`,
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
