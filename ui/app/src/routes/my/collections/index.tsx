import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/collections/")({
  component: MyCollectionsRedirectPage,
});

function MyCollectionsRedirectPage() {
  return <Navigate to="/my/collections/list" replace />;
}
