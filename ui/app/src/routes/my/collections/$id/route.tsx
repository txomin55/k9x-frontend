import { createFileRoute } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";
import { getCachedCollections } from "@/services/secured/collection-crud/collectionCrud";
import ObdxCollectionDetail from "@/components/routes/my/collections/$id/obdx/ObdxCollectionDetail";
import Page from "@/components/common/page/Page";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

function CollectionDetailRoute() {
  return (
    <Suspense fallback={<CollectionDetailSkeleton />}>
      <ObdxCollectionDetail />
    </Suspense>
  );
}

function CollectionDetailSkeleton() {
  const i18n = useI18n();

  return (
    <Page title={i18n.t("MY.COLLECTIONS.DETAIL.SPECIFIC_SCORES")}>
      <div class="obdx-collection-detail__discipline">
        <AtomSkeleton
          variant="rectangular"
          width="var(--unit-6)"
          height="var(--unit-6)"
          radius="var(--radius-md)"
        />
        <AtomSkeleton width="14rem" />
      </div>

      <div class="obdx-collection-detail__competitor">
        <AtomSkeleton
          variant="rectangular"
          height="var(--unit-6)"
          radius="var(--radius-md)"
          style={{ flex: 1 }}
        />
        <AtomSkeleton
          variant="rectangular"
          width="var(--unit-6)"
          height="var(--unit-6)"
          radius="var(--radius-md)"
        />
        <AtomSkeleton
          variant="rectangular"
          width="var(--unit-6)"
          height="var(--unit-6)"
          radius="var(--radius-md)"
        />
      </div>

      <div
        class="collection-detail__exercises"
        style={{
          "--collection-detail-exercises-columns": "2fr repeat(3, 1.25fr)",
        }}
      >
        <div class="collection-detail__exercises--headers">
          <AtomSkeleton width="5rem" />
          <For each={Array.from({ length: 3 })}>
            {() => <AtomSkeleton width="4rem" />}
          </For>
        </div>
        <div class="collection-detail__exercises--rows">
          <For each={Array.from({ length: 6 })}>
            {() => (
              <div
                style={{
                  display: "grid",
                  "grid-template-columns":
                    "var(--collection-detail-exercises-columns)",
                  gap: "var(--unit-1)",
                  "align-items": "center",
                }}
              >
                <AtomSkeleton width="70%" />
                <For each={Array.from({ length: 3 })}>
                  {() => (
                    <AtomSkeleton
                      variant="rectangular"
                      height="var(--unit-5)"
                      radius="var(--radius-md)"
                    />
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </Page>
  );
}

type CollectionDetailSearch = {
  competitorId: string;
  judgesIds: string[];
};

function CollectionDetailBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.COLLECTIONS.DETAIL.BREADCRUMB_INFO")}</p>;
}

export const Route = createFileRoute("/my/collections/$id")({
  component: CollectionDetailRoute,
  staticData: {
    breadcrumb: (match) => {
      const collection = getCachedCollections()?.find(
        (entry) => entry.eventId === match.params.id,
      );

      return collection?.eventName;
    },
    breadcrumbInfo: CollectionDetailBreadcrumbInfo,
  },
  validateSearch: (
    search: Record<string, string | string[]>,
  ): CollectionDetailSearch => {
    const validatedSearch: CollectionDetailSearch = {
      competitorId: "",
      judgesIds: [],
    };

    if (typeof search.competitorId === "string") {
      validatedSearch.competitorId = search.competitorId ?? "";
    }

    if (Array.isArray(search.judgesIds)) {
      validatedSearch.judgesIds = search.judgesIds ?? [];
    }

    return validatedSearch;
  },
});
