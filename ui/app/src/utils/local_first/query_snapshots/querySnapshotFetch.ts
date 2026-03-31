import {
  getQuerySnapshot,
  getPersistedQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local_first/query_snapshots/querySnapshotsStore";
import { NetworkRequestError } from "@/utils/http/client";

export const fetchWithOfflineSnapshot = async <TData>(
  snapshotId: string,
  fetcher: () => Promise<TData>,
): Promise<TData> => {
  const snapshot = await getQuerySnapshot<TData>(snapshotId);

  if (snapshot !== undefined) {
    return snapshot as TData;
  }

  try {
    const data = await fetcher();
    await saveQuerySnapshot(snapshotId, data);

    return data;
  } catch (error) {
    if (!(error instanceof NetworkRequestError)) {
      throw error;
    }

    const persistedSnapshot = await getPersistedQuerySnapshot<TData>(snapshotId);

    if (persistedSnapshot !== undefined) {
      return persistedSnapshot;
    }

    throw error;
  }
};
