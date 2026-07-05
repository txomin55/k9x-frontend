import { createFileRoute } from "@tanstack/solid-router";
import { getCachedCollections } from "@/services/secured/collection-crud/collectionCrud";
import ObdxCollectionDetail from "@/components/routes/my/collections/$id/obdx/ObdxCollectionDetail";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type CollectionDetailSearch = {
  competitorId: string;
  judgesIds: string[];
};

function CollectionDetailBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.COLLECTIONS.DETAIL.BREADCRUMB_INFO")}</p>;
}

export const Route = createFileRoute("/my/collections/$id")({
  component: ObdxCollectionDetail,
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
