import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/judges")({
  component: MyJudgesLayoutPage,
});

function MyJudgesLayoutPage() {
  return <Outlet />;
}
