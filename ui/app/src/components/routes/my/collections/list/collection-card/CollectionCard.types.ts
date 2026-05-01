import { CollectionsRequest } from "@/services/secured/collection-crud/collectionCrud.types";

type CollectionCardProps = {
  collection: CollectionsRequest;
  onCollect: () => void;
};

export type { CollectionCardProps };
