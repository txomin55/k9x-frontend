import {
  LOCAL_FIRST_STORE_NAMES,
  localFirstDatabase,
} from "@/utils/local-first/storage/localFirstDatabase";
import {
  shouldPersistLocalFirstData,
  shouldReadFromIndexedDb,
} from "@/utils/local-first/localFirstPolicy";
import type { QuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshots.types";

export type { QuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshots.types";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const querySnapshotsTable = localFirstDatabase.table<QuerySnapshot, string>(
  LOCAL_FIRST_STORE_NAMES.querySnapshots,
);

const readPersistedQuerySnapshot = <TData>(
  id: string,
): Promise<TData | undefined> =>
  querySnapshotsTable
    .get(id)
    .then((snapshot) => snapshot?.data as TData | undefined);

export const saveQuerySnapshot = <TData>(id: string, data: TData) => {
  if (!shouldPersistLocalFirstData()) {
    return Promise.resolve(id);
  }

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

  return readPersistedQuerySnapshot(id);
};

export const getPersistedQuerySnapshot = readPersistedQuerySnapshot;

export const removeQuerySnapshot = (id: string) =>
  querySnapshotsTable.delete(id);

export const removeQuerySnapshotsByPrefix = (prefix: string) =>
  querySnapshotsTable.where("id").startsWith(prefix).delete();
