import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedEventName } from "@/services/fetch-stages/fetchStages";

export const Route = createFileRoute("/stages/$id/events/$eventId")({
  component: StageEventLayoutPage,
  staticData: {
    breadcrumb: (match) =>
      getCachedEventName(match.params.id, match.params.eventId),
  },
});

function StageEventLayoutPage() {
  return <Outlet />;
}
