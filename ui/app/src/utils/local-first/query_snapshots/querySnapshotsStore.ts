import {
  LOCAL_FIRST_STORE_NAMES,
  getLocalFirstTable,
} from "@/utils/local-first/storage/localFirstDatabase";
import {
  shouldPersistLocalFirstData,
  shouldReadFromIndexedDb,
} from "@/utils/local-first/localFirstPolicy";
import type { QuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshots.types";

export type { QuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshots.types";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const getQuerySnapshotsTable = () =>
  getLocalFirstTable<QuerySnapshot, string>(
    LOCAL_FIRST_STORE_NAMES.querySnapshots,
  );

const readPersistedQuerySnapshot = async <TData>(
  id: string,
): Promise<TData | undefined> => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  const snapshot = await querySnapshotsTable.get(id);
  return snapshot?.data as TData | undefined;
};

export const saveQuerySnapshot = async <TData>(id: string, data: TData) => {
  if (!shouldPersistLocalFirstData()) {
    return id;
  }

  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.put({
    data: toSerializable(data),
    id,
    updatedAt: Date.now(),
  } satisfies QuerySnapshot<TData>);
};

export const getQuerySnapshot = <TData>(id: string) => {
  if (!shouldReadFromIndexedDb()) {
    return Promise.resolve(undefined as TData | undefined);
  }

  return readPersistedQuerySnapshot<TData>(id);
};

export const getPersistedQuerySnapshot = readPersistedQuerySnapshot;

export const QUERY_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const pruneStaleQuerySnapshots = async (
  maxAgeMs: number = QUERY_SNAPSHOT_MAX_AGE_MS,
) => {
  if (!shouldPersistLocalFirstData()) {
    return 0;
  }

  const cutoff = Date.now() - maxAgeMs;
  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.where("updatedAt").below(cutoff).delete();
};

export const removeQuerySnapshot = async (id: string) => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.delete(id);
};

export const removeQuerySnapshotsByPrefix = async (prefix: string) => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.where("id").startsWith(prefix).delete();
};
