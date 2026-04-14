import { CollectionsRequest } from "@/services/api/collection-crud/collectionCrud.types";

type CollectionCardProps = {
  collection: CollectionsRequest;
  onCollect: () => void;
};

export type { CollectionCardProps };
