import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/collections")({
  component: MyCollectionsLayoutPage,
  staticData: {
    breadcrumb: "--Collections",
  },
});

function MyCollectionsLayoutPage() {
  return <Outlet />;
}
