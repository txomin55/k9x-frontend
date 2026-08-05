import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/methodology")({
  component: MethodologyLayoutPage,
  staticData: {
    breadcrumb: "METHODOLOGY.BREADCRUMB",
  },
});

function MethodologyLayoutPage() {
  return <Outlet />;
}
