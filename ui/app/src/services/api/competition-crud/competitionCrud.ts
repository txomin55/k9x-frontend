import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
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
} from "@/services/api/competition-crud/competitionCrudOfflineUtils";
import type {
  CompetitionDetail,
  CompetitionLocationDetail,
  CreateCompetitionRequest,
  UpdateCompetitionRequest
} from "@/services/api/competition-crud/competitionCrud.types";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { mergeCompetitionsWithDrafts } from "@/services/api/competition-crud/competitionDraftStore";

export type {
  CompetitionLocationDetail,
  CompetitionStageDetail,
  CompetitionDetail,
} from "@/services/api/competition-crud/competitionCrud.types";

const DRAFT_COMPETITION_STATUS = "draft";

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

const refreshCompetitionsSnapshot = async () => {
  const competitions = await rawRequest<CompetitionDetail[]>({
    path: "/api/competitions",
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

const toCompetitionLocation = (
  location?: CompetitionLocationDetail,
  previousLocation?: CompetitionLocationDetail,
): CompetitionLocationDetail | undefined => {
  if (!location && !previousLocation) return undefined;

  return {
    address: location?.address ?? previousLocation?.address,
    latitude: location?.latitude ?? previousLocation?.latitude,
    longitude: location?.longitude ?? previousLocation?.longitude,
  };
};

const mergeCompetitionWithPayload = (
  payload: CreateCompetitionRequest | UpdateCompetitionRequest,
  previousCompetition?: CompetitionDetail,
): CompetitionDetail => {
  const payloadId = "id" in payload ? payload.id : undefined;
  const country =
    "country" in payload
      ? payload.country
      : (previousCompetition?.country ?? "");
  const description =
    "description" in payload
      ? payload.description
      : previousCompetition?.description;
  const location =
    "location" in payload ? payload.location : previousCompetition?.location;

  return {
    country,
    description,
    id: payloadId ?? previousCompetition?.id ?? globalThis.crypto.randomUUID(),
    location: toCompetitionLocation(location, previousCompetition?.location),
    name: payload.name ?? previousCompetition?.name ?? "",
    notifications: previousCompetition?.notifications,
    stages: previousCompetition?.stages,
    status: previousCompetition?.status ?? DRAFT_COMPETITION_STATUS,
  };
};

const createDefaultCompetition = (): CreateCompetitionRequest => ({
  id: globalThis.crypto.randomUUID(),
  name: "--Default competition",
});

export const getCachedCompetitions = () =>
  mergeCompetitionsWithDrafts(
    queryClient.getQueryData<CompetitionDetail[]>(getCompetitionsQueryKey()),
  );

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

  const createCompetition = (payload: CreateCompetitionRequest) => {
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
        url: "/api/competitions",
      });
    })();
  };

  const updateCompetition = (id: string, payload: UpdateCompetitionRequest) => {
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
        url: `/api/competitions/${id}`,
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
