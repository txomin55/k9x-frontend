import {
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import {
  COLLECTIONS_SNAPSHOT_ID,
  getCollectionSnapshotId,
} from "@/services/api/collection-crud/collectionCrudConstants";
import {
  CollectionsRequest,
  CompetitorScores,
} from "@/services/api/collection-crud/collectionCrud.types";

export const saveCollectionsSnapshot = (collections: CollectionsRequest[]) =>
  saveQuerySnapshot(COLLECTIONS_SNAPSHOT_ID, collections);

export const saveCollectionSnapshot = (
  id: string,
  collection: CompetitorScores[],
) => saveQuerySnapshot(getCollectionSnapshotId(id), collection);
