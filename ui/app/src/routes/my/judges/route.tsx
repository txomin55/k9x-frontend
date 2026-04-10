import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/judges")({
  component: MyJudgesLayoutPage,
  staticData: {
    breadcrumb: "--Judges",
  },
});

function MyJudgesLayoutPage() {
  return <Outlet />;
}
