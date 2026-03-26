import {
  LOCAL_FIRST_STORE_NAMES,
  localFirstDatabase,
} from "@/services/storage/localFirstDatabase";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const querySnapshotsTable = localFirstDatabase.table<QuerySnapshot, string>(
  LOCAL_FIRST_STORE_NAMES.querySnapshots,
);

export const saveQuerySnapshot = <TData>(id: string, data: TData) =>
  querySnapshotsTable.put({
    data: toSerializable(data),
    id,
    updatedAt: Date.now(),
  } satisfies QuerySnapshot<TData>);

export const getQuerySnapshot = <TData>(id: string) =>
  querySnapshotsTable.get(id).then((snapshot) => snapshot?.data as TData | undefined);

export const removeQuerySnapshot = (id: string) =>
  querySnapshotsTable.delete(id);

export interface QuerySnapshot<TData = unknown> {
  data: TData;
  id: string;
  updatedAt: number;
}
