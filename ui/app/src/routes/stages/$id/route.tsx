import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageById } from "@/services/fetch-stages/fetchStages";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => getCachedStageById(match.params.id)?.name,
  },
});

function EventDetailLayoutPage() {
  return <Outlet />;
}
