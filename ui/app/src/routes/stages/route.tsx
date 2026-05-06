import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/stages")({
  component: StagesLayoutPage,
  staticData: {
    breadcrumb: "STAGES.BREADCRUMB",
  },
});

function StagesLayoutPage() {
  return <Outlet />;
}
