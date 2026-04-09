import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/dogs/")({
  component: MyDogsRedirectPage,
});

function MyDogsRedirectPage() {
  return <Navigate to="/my/dogs/list" replace />;
}
