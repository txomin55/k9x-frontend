import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my-competitions")({
  component: MyCompetitionsLayoutPage,
});

function MyCompetitionsLayoutPage() {
  return <Outlet />;
}
