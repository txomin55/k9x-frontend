import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedEventName } from "@/services/fetch-stages/fetchStages";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

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
  return <BreadcrumbInfoSlides slides={[[{ keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO"] }]]} />;
}
