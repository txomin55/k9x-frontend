import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/rankings/")({
  component: MyRankingsRedirectPage,
});

function MyRankingsRedirectPage() {
  return <Navigate to="/my/rankings/list" replace />;
}
