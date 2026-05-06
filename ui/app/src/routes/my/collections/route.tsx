import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/collections")({
  component: MyCollectionsLayoutPage,
  staticData: {
    breadcrumb: "MY.COLLECTIONS.BREADCRUMB",
  },
});

function MyCollectionsLayoutPage() {
  return <Outlet />;
}
