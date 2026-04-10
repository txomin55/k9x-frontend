import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/dogs")({
  component: MyDogsLayoutPage,
  staticData: {
    breadcrumb: "--Dogs",
  },
});

function MyDogsLayoutPage() {
  return <Outlet />;
}
