import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/competitions")({
  component: MyCompetitionsLayoutPage,
  staticData: {
    breadcrumb: "--Competitions",
  },
});

function MyCompetitionsLayoutPage() {
  return <Outlet />;
}
