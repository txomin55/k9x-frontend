import {
  getQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local_first/query_snapshots/querySnapshotsStore";

export const fetchWithOfflineSnapshot = async <TData>(
  snapshotId: string,
  fetcher: () => Promise<TData>,
): Promise<TData> => {
  const snapshot = await getQuerySnapshot<TData>(snapshotId);

  if (snapshot !== undefined) {
    return snapshot as TData;
  }

  const data = await fetcher();
  await saveQuerySnapshot(snapshotId, data);

  return data;
};
