import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/my/judges")({
  component: MyJudgesLayoutPage,
  staticData: {
    breadcrumb: "MY.JUDGES.BREADCRUMB",
  },
});

function MyJudgesLayoutPage() {
  return <Outlet />;
}
