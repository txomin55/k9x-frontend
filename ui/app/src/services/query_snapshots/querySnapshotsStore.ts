import {
  LOCAL_FIRST_STORE_NAMES,
  toRequestPromise,
  withLocalFirstStore,
} from "@/services/storage/localFirstDatabase";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const withQuerySnapshotsStore = <TResult>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TResult> | TResult,
) =>
  withLocalFirstStore(LOCAL_FIRST_STORE_NAMES.querySnapshots, mode, callback);

export const saveQuerySnapshot = <TData>(id: string, data: TData) =>
  withQuerySnapshotsStore("readwrite", async (store) => {
    await toRequestPromise(
      store.put({
        data: toSerializable(data),
        id,
        updatedAt: Date.now(),
      } satisfies QuerySnapshot<TData>),
    );
  });

export const getQuerySnapshot = <TData>(id: string) =>
  withQuerySnapshotsStore("readonly", async (store) => {
    const snapshot =
      (await toRequestPromise(store.get(id))) as QuerySnapshot<TData> | undefined;
    return snapshot?.data;
  });

export const removeQuerySnapshot = (id: string) =>
  withQuerySnapshotsStore("readwrite", async (store) => {
    await toRequestPromise(store.delete(id));
  });

export interface QuerySnapshot<TData = unknown> {
  data: TData;
  id: string;
  updatedAt: number;
}
