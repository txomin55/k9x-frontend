import type { Table } from "dexie";
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

export const QUERY_SNAPSHOTS_PER_PREFIX = 50;

const LAST_READ_REFRESH_MS = 5 * 60 * 1000;

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const getSnapshotPrefix = (id: string) => {
  const separatorIndex = id.indexOf(":");

  return separatorIndex > 0 ? id.slice(0, separatorIndex + 1) : undefined;
};

const getQuerySnapshotsTable = () =>
  getLocalFirstTable<QuerySnapshot, string>(
    LOCAL_FIRST_STORE_NAMES.querySnapshots,
  );

const touchQuerySnapshot = async (
  querySnapshotsTable: Table<QuerySnapshot, string>,
  snapshot: QuerySnapshot,
) => {
  const now = Date.now();

  if (now - snapshot.lastReadAt < LAST_READ_REFRESH_MS) {
    return;
  }

  await querySnapshotsTable.update(snapshot.id, { lastReadAt: now });
};

const readPersistedQuerySnapshot = async <TData>(
  id: string,
): Promise<TData | undefined> => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  const snapshot = await querySnapshotsTable.get(id);

  if (!snapshot) {
    return undefined;
  }

  void touchQuerySnapshot(querySnapshotsTable, snapshot);

  return snapshot.data as TData;
};

const enforcePrefixQuota = async (
  querySnapshotsTable: Table<QuerySnapshot, string>,
  prefix: string,
) => {
  const family = () =>
    querySnapshotsTable
      .where("[prefix+lastReadAt]")
      .between([prefix, 0], [prefix, Infinity]);
  const excess = (await family().count()) - QUERY_SNAPSHOTS_PER_PREFIX;

  if (excess <= 0) {
    return 0;
  }

  const evicted = await family().limit(excess).primaryKeys();
  await querySnapshotsTable.bulkDelete(evicted);

  return evicted.length;
};

export const saveQuerySnapshot = async <TData>(id: string, data: TData) => {
  if (!shouldPersistLocalFirstData()) {
    return id;
  }

  const now = Date.now();
  const prefix = getSnapshotPrefix(id);
  const querySnapshotsTable = await getQuerySnapshotsTable();
  const saved = await querySnapshotsTable.put({
    data: toSerializable(data),
    id,
    lastReadAt: now,
    ...(prefix ? { prefix } : {}),
    updatedAt: now,
  } satisfies QuerySnapshot<TData>);

  if (prefix) {
    await enforcePrefixQuota(querySnapshotsTable, prefix);
  }

  return saved;
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

export const enforceQuerySnapshotQuotas = async () => {
  if (!shouldPersistLocalFirstData()) {
    return 0;
  }

  const querySnapshotsTable = await getQuerySnapshotsTable();
  const prefixes = (await querySnapshotsTable
    .orderBy("prefix")
    .uniqueKeys()) as string[];

  const evicted = await Promise.all(
    prefixes.map((prefix) => enforcePrefixQuota(querySnapshotsTable, prefix)),
  );

  return evicted.reduce((total, count) => total + count, 0);
};

export const removeQuerySnapshot = async (id: string) => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.delete(id);
};

export const removeQuerySnapshotsByPrefix = async (prefix: string) => {
  const querySnapshotsTable = await getQuerySnapshotsTable();
  return querySnapshotsTable.where("id").startsWith(prefix).delete();
};
