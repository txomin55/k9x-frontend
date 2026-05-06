import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/competitions")({
  component: MyCompetitionsLayoutPage,
  staticData: {
    breadcrumb: "MY.COMPETITIONS.BREADCRUMB",
  },
});

function MyCompetitionsLayoutPage() {
  return <Outlet />;
}
