import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/stages")({
  component: StagesLayoutPage,
  staticData: {
    breadcrumb: "--Stages",
  },
});

function StagesLayoutPage() {
  return <Outlet />;
}
