import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

export const Route = createFileRoute("/my/rankings")({
  component: MyRankingsLayoutPage,
  staticData: {
    breadcrumb: "MY.RANKINGS.BREADCRUMB",
    breadcrumbInfo: MyRankingsBreadcrumbInfo,
  },
});

function MyRankingsLayoutPage() {
  return <Outlet />;
}

function MyRankingsBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO"] }],
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO_2"] }],
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO_3"] }],
      ]}
    />
  );
}
