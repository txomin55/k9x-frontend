import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { getCurrentLocale, translate } from "@/stores/i18n/i18n";
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
  getVisibleCompetitions,
} from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import type {
  CompetitionResponseDTO,
  UpdateCompetitionRequestDTO,
} from "@/services/secured/competition-crud/competitionCrud.types";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { mergeCompetitionsWithDrafts } from "@/services/secured/competition-crud/competitionDraftStore";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { isOrganizer } from "@/stores/auth/auth";
import { generateEntityId } from "@/utils/id/generateEntityId";
import { COMPETITION_STATUS } from "@/utils/competition";

export type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

export const refreshCompetitionsSnapshot = async () => {
  if (!isOrganizer()) {
    return (
      queryClient.getQueryData<CompetitionResponseDTO[]>(
        getCompetitionsQueryKey(),
      ) ?? []
    );
  }

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
    description: description ?? "",
    id: payloadId ?? previousCompetition?.id ?? generateEntityId("competition"),
    address: address ?? previousCompetition?.address ?? "",
    name: payload.name ?? previousCompetition?.name ?? "",
    notifications: previousCompetition?.notifications ?? [],
    stages: previousCompetition?.stages ?? [],
    status: previousCompetition?.status ?? COMPETITION_STATUS.DRAFT,
  };
};

const createDefaultCompetition = (): IdNameDTO => ({
  id: generateEntityId("competition"),
  name: translate("MY.COMPETITIONS.DETAIL.DEFAULT_COMPETITION"),
});

export const getCachedCompetitions = () =>
  mergeCompetitionsWithDrafts(
    queryClient.getQueryData<CompetitionResponseDTO[]>(
      getCompetitionsQueryKey(),
    ),
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
