import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { queryClient } from "@/utils/http/query-client";
import {
  applyJudgeRemoval,
  applyJudgeUpsert,
  commitJudgeMutation,
  createJudgeRollbackPayload,
  getVisibleJudges,
  saveJudgesSnapshot,
} from "./judgeCrudOfflineUtils";
import type {
  CreateJudgeRequestDTO,
  JudgeResponseDTO,
  UpdateJudgeRequestDTO,
} from "./judgeCrud.types";
import {
  CREATED_JUDGES_SNAPSHOT_ID,
  getCreatedJudgesQueryKey,
  getJudgesQueryKey,
  JUDGES_SNAPSHOT_ID,
} from "./judgeCrudConstants";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { mergeJudgesWithDrafts } from "./judgeDraftStore";
import { isOrganizer } from "@/stores/auth/auth";
import { generateEntityId } from "@/utils/id/generateEntityId";

const refreshJudgesSnapshot = async () => {
  if (!isOrganizer()) {
    return queryClient.getQueryData<JudgeResponseDTO[]>(getJudgesQueryKey()) ?? [];
  }

  const judges = await rawRequest<JudgeResponseDTO[]>({
    path: "/secured/judges",
  });

  await saveJudgesSnapshot(judges);
  queryClient.setQueryData(getJudgesQueryKey(), judges);

  return judges;
};

const fetchJudges = () =>
  fetchWithOfflineSnapshot(JUDGES_SNAPSHOT_ID, refreshJudgesSnapshot);

const refreshCreatedJudgesSnapshot = async () => {
  if (!isOrganizer()) {
    return (
      queryClient.getQueryData<JudgeResponseDTO[]>(getCreatedJudgesQueryKey()) ??
      []
    );
  }

  const judges = await rawRequest<JudgeResponseDTO[]>({
    path: "/secured/judges?created=true",
  });

  await saveQuerySnapshot(CREATED_JUDGES_SNAPSHOT_ID, judges);
  queryClient.setQueryData(getCreatedJudgesQueryKey(), judges);

  return judges;
};

const fetchCreatedJudges = () =>
  fetchWithOfflineSnapshot(
    CREATED_JUDGES_SNAPSHOT_ID,
    refreshCreatedJudgesSnapshot,
  );

const createJudgesQuery = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchJudges,
    queryKey: ["judges"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    get enabled() {
      return options?.enabled ? options.enabled() : true;
    },
  } as any);

export const prefetchJudges = (options?: TanstackCreateQuery) => {
  const judgesQuery = defineQuery({
    fetcher: fetchJudges,
    queryKey: ["judges"] as const,
  });
  const { queryFn, queryKey } = judgesQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

const withMergedJudgeDrafts = <T extends { data?: JudgeResponseDTO[] }>(
  judges: T,
): T =>
  new Proxy(judges, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergeJudgesWithDrafts(target.data ?? []);
      }

      return Reflect.get(target, property, receiver);
    },
  });

export const useJudges = (options?: TanstackCreateQuery) =>
  createJudgesQuery(options);

const createCreatedJudgesQuery = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchCreatedJudges,
    queryKey: ["judges", "created"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    get enabled() {
      return options?.enabled ? options.enabled() : true;
    },
  } as any);

export const useCreatedJudges = (options?: TanstackCreateQuery) =>
  withMergedJudgeDrafts(createCreatedJudgesQuery(options));

const mergeJudgeWithPayload = (
  payload: CreateJudgeRequestDTO,
  existingJudge?: JudgeResponseDTO,
): JudgeResponseDTO => ({
  id: payload.id ?? existingJudge?.id ?? generateEntityId("judge"),
  name: payload.name ?? existingJudge?.name ?? "",
  country: payload.country ?? existingJudge?.country ?? "",
});

const updateJudgeProjection = (
  existingJudge: JudgeResponseDTO,
  payload: UpdateJudgeRequestDTO,
): JudgeResponseDTO => ({
  ...existingJudge,
  name: payload.name,
  country: payload.country,
});

export const createJudge = (payload: CreateJudgeRequestDTO) => {
  const previousJudges = getVisibleJudges();
  const draftJudge = mergeJudgeWithPayload(payload);

  applyJudgeUpsert(draftJudge);

  void (async () => {
    await commitJudgeMutation({
      entityId: draftJudge.id,
      method: "POST",
      payload: draftJudge,
      rollbackPayload: await createJudgeRollbackPayload(
        draftJudge.id,
        null,
        previousJudges,
      ),
      url: "/secured/judges",
    });
  })();

  return draftJudge;
};

export const updateJudge = (id: string, payload: UpdateJudgeRequestDTO) => {
  const previousJudges = getVisibleJudges();
  const previousJudge = previousJudges.find((judge) => judge.id === id) ?? null;

  if (!previousJudge) {
    throw new Error(`IdNameDTO ${id} not found`);
  }

  const draftJudge = updateJudgeProjection(previousJudge, payload);

  applyJudgeUpsert(draftJudge);

  void (async () => {
    await commitJudgeMutation({
      entityId: id,
      method: "PUT",
      payload,
      rollbackPayload: await createJudgeRollbackPayload(
        id,
        previousJudge,
        previousJudges,
      ),
      url: `/secured/judges/${id}`,
    });
  })();

  return draftJudge;
};

export const deleteJudge = (id: string) => {
  const previousJudges = getVisibleJudges();
  const previousJudge = previousJudges.find((judge) => judge.id === id) ?? null;

  applyJudgeRemoval(id);

  void (async () => {
    await commitJudgeMutation({
      entityId: id,
      method: "DELETE",
      rollbackPayload: await createJudgeRollbackPayload(
        id,
        previousJudge,
        previousJudges,
      ),
      url: `/secured/judges/${id}`,
    });
  })();
};
