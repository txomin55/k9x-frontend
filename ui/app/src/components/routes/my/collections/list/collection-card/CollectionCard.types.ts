import { CollectionsResponseDTO } from "@/services/secured/collection-crud/collectionCrud.types";

type CollectionCardProps = {
  collection: CollectionsResponseDTO;
  onCollect: () => void;
};

export type { CollectionCardProps };
