import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useCollections } from "@/services/secured/collection-crud/collectionCrud";
import { For, Show, Suspense } from "solid-js";
import CollectionCard from "@/components/routes/my/collections/list/collection-card/CollectionCard";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import Page from "@/components/common/page/Page";
import { useI18n } from "@/stores/i18n/i18n";
import { isOffline } from "@/utils/local-first/localFirstPolicy";

export const Route = createFileRoute("/my/collections/list/")({
  component: MyCollectionsRoute,
});

function MyCollectionsRoute() {
  return (
    <Suspense
      fallback={
        <Page>
          <div class="collections-list card-list">
            <CardListSkeleton count={6} />
          </div>
        </Page>
      }
    >
      <MyCollectionsListPage />
    </Suspense>
  );
}

function MyCollectionsListPage() {
  const i18n = useI18n();
  const navigate = useNavigate();

  const collectionsQuery = useCollections({
    refetchOnMount: !isOffline(),
    gcTime: 2 * 60 * 1000,
  });

  const navigateToCollectScoresView = (
    eventId: string,
    judges: IdNameDTO[],
  ) => {
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
    <Page>
      <Show
        when={collectionsQuery.data?.length}
        fallback={
          <p>{i18n.t("MY.COLLECTIONS.LIST.NO_COLLECTIONS_AVAILABLE_YET")}</p>
        }
      >
        <div class="collections-list card-list">
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
    </Page>
  );
}
