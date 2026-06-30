import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useCollections } from "@/services/secured/collection-crud/collectionCrud";
import { For, Show, Suspense } from "solid-js";
import CollectionCard from "@/components/routes/my/collections/list/collection-card/CollectionCard";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import Page from "@/components/common/page/Page";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/collections/list/")({
  component: MyCollectionsListPage,
});

function MyCollectionsListPage() {
  const i18n = useI18n();
  const navigate = useNavigate();

  const collectionsQuery = useCollections({
    refetchOnMount: false,
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
    <Page title={i18n.t("MY.COLLECTIONS.LIST.COLLECTIONS")}>
      <Suspense
        fallback={
          <span>{i18n.t("MY.COLLECTIONS.LIST.LOADING_COLLECTIONS")}</span>
        }
      >
        <Show
          when={collectionsQuery.data?.length}
          fallback={
            <p>{i18n.t("MY.COLLECTIONS.LIST.NO_COLLECTIONS_AVAILABLE_YET")}</p>
          }
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
    </Page>
  );
}
