import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/dogs")({
  component: MyDogsLayoutPage,
});

function MyDogsLayoutPage() {
  return <Outlet />;
}
