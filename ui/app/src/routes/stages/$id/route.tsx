import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageName } from "@/services/fetch-stages/fetchStages";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const label = getCachedStageName(match.params.id);
      return label
        ? { label, route: `/stages/${match.params.id}/info` }
        : null;
    },
  },
});

function EventDetailLayoutPage() {
  return <Outlet />;
}
