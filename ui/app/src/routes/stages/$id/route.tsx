import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageName } from "@/services/fetch-stages/fetchStages";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => getCachedStageName(match.params.id),
  },
});

function EventDetailLayoutPage() {
  return <Outlet />;
}
