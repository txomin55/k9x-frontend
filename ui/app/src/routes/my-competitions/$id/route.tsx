import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my-competitions/$id")({
  component: CompetitionDetailLayoutPage,
});

function CompetitionDetailLayoutPage() {
  return <Outlet />;
}
