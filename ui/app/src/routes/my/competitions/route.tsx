import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

export const Route = createFileRoute("/my/competitions")({
  component: MyCompetitionsLayoutPage,
  staticData: {
    breadcrumb: "MY.COMPETITIONS.BREADCRUMB",
    breadcrumbInfo: MyCompetitionsBreadcrumbInfo,
  },
});

function MyCompetitionsLayoutPage() {
  return <Outlet />;
}

function MyCompetitionsBreadcrumbInfo() {
  return <BreadcrumbInfoSlides slides={[[{ keys: ["MY.COMPETITIONS.BREADCRUMB_INFO"] }]]} />;
}
