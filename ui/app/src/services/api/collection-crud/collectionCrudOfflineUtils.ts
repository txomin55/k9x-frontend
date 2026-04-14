import {
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { COLLECTIONS_SNAPSHOT_ID } from "@/services/api/collection-crud/collectionCrudConstants";
import { CollectionsRequest } from "@/services/api/collection-crud/collectionCrud.types";

const COLLECTIONS_SNAPSHOT_PREFIX = "collection";
export const saveCollectionsSnapshot = (collections: CollectionsRequest[]) =>
  removeQuerySnapshotsByPrefix(COLLECTIONS_SNAPSHOT_PREFIX).then(() =>
    saveQuerySnapshot(COLLECTIONS_SNAPSHOT_ID, collections),
  );
