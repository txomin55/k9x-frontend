import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

export const Route = createFileRoute("/my/judges")({
  component: MyJudgesLayoutPage,
  staticData: {
    breadcrumb: "MY.JUDGES.BREADCRUMB",
    breadcrumbInfo: MyJudgesBreadcrumbInfo,
  },
});

function MyJudgesLayoutPage() {
  return <Outlet />;
}

function MyJudgesBreadcrumbInfo() {
  return <BreadcrumbInfoSlides slides={[[{ keys: ["MY.JUDGES.BREADCRUMB_INFO"] }]]} />;
}
