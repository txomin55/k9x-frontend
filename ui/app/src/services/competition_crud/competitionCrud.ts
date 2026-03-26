import {
  applyCompetitionRemoval,
  applyCompetitionUpsert,
  createCompetitionRollbackPayload,
  queueCompetitionMutation,
} from "@/services/competition_crud/competitionCrudOfflineUtils";
import type {
  Competition,
  CompetitionLocation,
  CompetitionStage,
  PostCompetition,
  Stage,
} from "@/services/competition_crud/competitionCrudTypes";
import {
  getCompetitionsQueryKey,
  type Competitions,
} from "@/services/fetch_competitions/fetchCompetitions";
import { queryClient } from "@/utils/http/query-client";

const DRAFT_COMPETITION_STATUS = "draft";

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
  const createCompetition = (payload: PostCompetition) => {
    const previousCompetitionsFromCache = queryClient.getQueryData<Competitions[]>(
      getCompetitionsQueryKey(),
    );
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
    const previousCompetitionsFromCache = queryClient.getQueryData<Competitions[]>(
      getCompetitionsQueryKey(),
    );
    const previousCompetition =
      previousCompetitionsFromCache?.find(
        (competition) => competition.id === entityId,
      ) ??
      undefined;
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
    const previousCompetitionsFromCache = queryClient.getQueryData<Competitions[]>(
      getCompetitionsQueryKey(),
    );
    const previousCompetition =
      previousCompetitionsFromCache?.find((competition) => competition.id === id) ??
      undefined;

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
    updateCompetition,
  };
};
