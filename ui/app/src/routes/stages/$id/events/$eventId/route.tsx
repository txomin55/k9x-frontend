import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedEventName } from "@/services/fetch-stages/fetchStages";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/stages/$id/events/$eventId")({
  component: StageEventLayoutPage,
  staticData: {
    breadcrumb: (match) =>
      getCachedEventName(match.params.id, match.params.eventId),
    breadcrumbInfo: StageEventBreadcrumbInfo,
  },
});

function StageEventLayoutPage() {
  return <Outlet />;
}

function StageEventBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("STAGES.EVENT_DETAIL.BREADCRUMB_INFO")}</p>;
}
