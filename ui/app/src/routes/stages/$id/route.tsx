import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
});

function EventDetailLayoutPage() {
  return <Outlet />;
}
