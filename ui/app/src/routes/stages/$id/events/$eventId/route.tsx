import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/stages/$id/events/$eventId")({
  component: StageEventLayoutPage,
});

function StageEventLayoutPage() {
  return <Outlet />;
}
