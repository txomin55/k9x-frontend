import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import rankingsViewModes from "@/assets/breadcrumb-info/rankings-view-modes.webp";
import rankingsCard from "@/assets/breadcrumb-info/rankings-card.webp";
import rankingsForm from "@/assets/breadcrumb-info/rankings-form.webp";
import rankingsResults from "@/assets/breadcrumb-info/rankings-results.webp";

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
        [
          {
            keys: ["MY.RANKINGS.BREADCRUMB_INFO_VIEW_MODES"],
            image: rankingsViewModes,
          },
        ],
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO_2"] }],
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO_3"], image: rankingsCard }],
        [{ keys: ["MY.RANKINGS.BREADCRUMB_INFO_FORM"], image: rankingsForm }],
        [
          {
            keys: ["MY.RANKINGS.BREADCRUMB_INFO_RESULTS"],
            image: rankingsResults,
          },
        ],
      ]}
    />
  );
}
