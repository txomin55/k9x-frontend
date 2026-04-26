import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedEventById } from "@/services/fetch-stages/fetchStages";

export const Route = createFileRoute("/stages/$id/events/$eventId")({
  component: StageEventLayoutPage,
  staticData: {
    breadcrumb: (match) =>
      getCachedEventById(match.params.id, match.params.eventId)?.name,
  },
});

function StageEventLayoutPage() {
  return <Outlet />;
}
