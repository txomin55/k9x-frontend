import { createMemo } from "solid-js";
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
  saveJudgesSnapshot,
} from "./judgeCrudOfflineUtils";
import type { CreateJudgeRequest, Judge } from "./judgeCrud.types";
import { getJudgesQueryKey, JUDGES_SNAPSHOT_ID } from "./judgeCrudConstants";
import { mergeJudgesWithDrafts } from "./judgeDraftStore";

const refreshJudgesSnapshot = async () => {
  const judges = await rawRequest<Judge[]>({
    path: "/api/judges",
  });

  await saveJudgesSnapshot(judges);
  queryClient.setQueryData(getJudgesQueryKey(), judges);

  return judges;
};

const fetchJudges = () =>
  fetchWithOfflineSnapshot(JUDGES_SNAPSHOT_ID, refreshJudgesSnapshot);

const judgesQuery = defineQuery({
  fetcher: fetchJudges,
  queryKey: ["judges"] as const,
});

const createJudgesQuery = (options?: TanstackCreateQuery) =>
  judgesQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  } as any);

export const prefetchJudges = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = judgesQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useJudges = (options?: TanstackCreateQuery) => {
  const judges = createJudgesQuery(options as any);
  const mergedData = createMemo(() => mergeJudgesWithDrafts(judges.data ?? []));

  return new Proxy(judges, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergedData();
      }

      return Reflect.get(target, property, receiver);
    },
  });
};

const mergeJudgeWithPayload = (
  payload: CreateJudgeRequest,
  existingJudge?: Judge,
): Judge => ({
  id: payload.id ?? existingJudge?.id ?? globalThis.crypto.randomUUID(),
  name: payload.name ?? existingJudge?.name ?? "",
});

export const getCachedJudges = () =>
  queryClient.getQueryData<Judge[]>(getJudgesQueryKey()) ?? [];

export const createJudge = (payload: CreateJudgeRequest) => {
  const previousJudges = getCachedJudges();
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
      url: "/api/judges",
    });
  })();

  return draftJudge;
};

export const deleteJudge = (id: string) => {
  const previousJudges = getCachedJudges();
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
      url: `/api/judges/${id}`,
    });
  })();
};
