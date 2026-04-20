import { createFileRoute, useParams } from "@tanstack/solid-router";
import {
  getCachedCollections,
  useCollectionById,
} from "@/services/api/collection-crud/collectionCrud";

export const Route = createFileRoute("/my/collections/$id")({
  component: CollectionDetailPage,
  staticData: {
    breadcrumb: (match) => {
      const collection = getCachedCollections()?.find(
        (entry) => entry.eventId === match.params.id,
      );

      return collection?.eventName;
    },
  },
});

function CollectionDetailPage() {
  const params = useParams({ from: "/my/collections/$id" });
  const collectionData = useCollectionById(params().id);

  return (
    <div class="collection-detail">
      <h1>--SPECIFIC SCORES</h1>
      <p>event id -- {params().id}</p>
      <pre>{JSON.stringify(collectionData.data, null, 2)}</pre>
    </div>
  );
}
