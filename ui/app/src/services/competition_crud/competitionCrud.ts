import { type CreateQueryResult } from "@tanstack/solid-query";
import {
  applyCompetitionRemoval,
  applyCompetitionUpsert,
  buildNextCompetitions,
  createCompetitionRollbackPayload,
  getCompetitionDetailKey,
  getCompetitionsListKey,
  queueCompetitionMutation,
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot
} from "@/services/competition_crud/competitionCrudOfflineUtils";
import type {
  Competition,
  CompetitionLocation,
  CompetitionStage,
  PostCompetition,
  Stage
} from "@/services/competition_crud/competitionCrudTypes";
import type { Competitions } from "@/services/fetch_competitions/fetchCompetitions";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery, type TanstackCreateQuery } from "@/utils/http/query-factory";

const DRAFT_COMPETITION_STATUS = "draft";

const refreshCompetitionSnapshot = async (id: string) => {
  const competition = await rawRequest<Competition>({
    path: `/api/competitions/${id}`,
  });

  queryClient.setQueryData(getCompetitionDetailKey(id), competition);

  const previousCompetitions = (await readCompetitionsSnapshot()) ?? [];
  const nextCompetitions = buildNextCompetitions(
    previousCompetitions,
    competition,
  );

  await saveCompetitionsSnapshot(nextCompetitions);
  queryClient.setQueryData(getCompetitionsListKey(), nextCompetitions);

  return competition;
};

const fetchCompetition = async (id: string) => {
  const competitionsSnapshot = await readCompetitionsSnapshot();
  const competitionSnapshot = competitionsSnapshot?.find(
    (competition) => competition.id === id,
  );

  if (competitionSnapshot) {
    if (globalThis.navigator.onLine) {
      void refreshCompetitionSnapshot(id).catch(() => undefined);
    }

    return competitionSnapshot as Competition;
  }

  return refreshCompetitionSnapshot(id);
};

const competitionQuery = defineQuery({
  fetcher: fetchCompetition,
  queryKey: (id: string) => ["competition", id] as const,
});

const toCompetitionStage = (
  stage: CompetitionStage,
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

export const createDefaultCompetition = (): PostCompetition => ({
  country: "pt",
  id: globalThis.crypto.randomUUID(),
  name: "--Default competition",
});

export const useCompetition = () => {
  const getCompetition = (
    id: string,
    options?: TanstackCreateQuery,
  ): CreateQueryResult<Competition, Error> =>
    competitionQuery.useQuery([id], {
      gcTime: options?.gcTime,
      networkMode: "always",
      refetchOnMount: options?.refetchOnMount,
      staleTime: options?.staleTime,
    });

  const createCompetition = (payload: PostCompetition) => {
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsListKey());
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
    const previousCompetition = queryClient.getQueryData<Competition>(
      getCompetitionDetailKey(entityId),
    );
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsListKey());
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
    const previousCompetition = queryClient.getQueryData<Competition>(
      getCompetitionDetailKey(id),
    );
    const previousCompetitionsFromCache = queryClient.getQueryData<
      Competitions[]
    >(getCompetitionsListKey());

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
    createCompetition,
    deleteCompetition,
    getCompetition,
    updateCompetition,
  };
};
