import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailLayoutPage,
});

function EventDetailLayoutPage() {
  return <Outlet />;
}
