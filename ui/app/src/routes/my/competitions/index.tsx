import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/competitions/")({
  component: MyCompetitionsRedirectPage,
});

function MyCompetitionsRedirectPage() {
  return <Navigate to="/my/competitions/list" replace />;
}
