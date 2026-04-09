import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/judges/")({
  component: MyJudgesRedirectPage,
});

function MyJudgesRedirectPage() {
  return <Navigate to="/my/judges/list" replace />;
}
