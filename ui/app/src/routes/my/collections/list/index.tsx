import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useCollections } from "@/services/api/collection-crud/collectionCrud";
import { For, Show, Suspense } from "solid-js";
import CollectionCard from "@/components/routes/my/collections/list/collection-card/CollectionCard";
import { Judge } from "@/services/api/judge-crud/judgeCrud.types";

export const Route = createFileRoute("/my/collections/list/")({
  component: MyCollectionsListPage,
});

function MyCollectionsListPage() {
  const navigate = useNavigate();

  const collectionsQuery = useCollections({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const navigateToCollectScoresView = (eventId: string, judges: Judge[]) => {
    void navigate({
      params: {
        id: eventId,
      },
      search: {
        competitorId: "",
        judgesIds: judges.map((judge) => judge.id),
      },
      to: "/my/collections/$id",
    });
  };
  return (
    <div class="my-collections-list">
      <h1>--Collections</h1>
      <Suspense fallback={<span>--Loading collections</span>}>
        <Show
          when={collectionsQuery.data?.length}
          fallback={<p>--No collections available yet.</p>}
        >
          <div class="collections-list">
            <For each={collectionsQuery.data}>
              {(collection) => (
                <CollectionCard
                  collection={collection}
                  onCollect={() =>
                    navigateToCollectScoresView(
                      collection.eventId,
                      collection.judges,
                    )
                  }
                />
              )}
            </For>
          </div>
        </Show>
      </Suspense>
    </div>
  );
}
