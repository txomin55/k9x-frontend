import { createFileRoute, useParams, useSearch } from "@tanstack/solid-router";
import { getCachedCollections } from "@/services/api/collection-crud/collectionCrud";

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
  const search = useSearch({ from: "/my/collections/$id" });

  return (
    <div class="collection-detail">
      <h1>--SPECIFIC SCORES</h1>
      <p>event id -- {params().id}</p>
      <p>search -- {JSON.stringify(search())}</p>
    </div>
  );
}
