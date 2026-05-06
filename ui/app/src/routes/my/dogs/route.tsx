import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/dogs")({
  component: MyDogsLayoutPage,
  staticData: {
    breadcrumb: "MY.DOGS.BREADCRUMB",
  },
});

function MyDogsLayoutPage() {
  return <Outlet />;
}
