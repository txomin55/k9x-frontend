import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageName } from "@/services/fetch-stages/fetchStages";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const label = getCachedStageName(match.params.id);
      return label
        ? { label, route: `/stages/${match.params.id}/info` }
        : null;
    },
    breadcrumbInfo: StageDetailBreadcrumbInfo,
  },
});

function EventDetailLayoutPage() {
  return <Outlet />;
}

function StageDetailBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("STAGES.DETAIL.BREADCRUMB_INFO")}</p>;
}
