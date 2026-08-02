import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import competitionDetail from "@/assets/breadcrumb-info/competition-detail.webp";
import competitionDetailViewModes from "@/assets/breadcrumb-info/competition-detail-view-modes.webp";
import competitionDetailGear from "@/assets/breadcrumb-info/competition-detail-gear.webp";
import competitionDetailEditStack from "@/assets/breadcrumb-info/competition-detail-edit-stack.webp";
import competitionDetailActions from "@/assets/breadcrumb-info/competition-detail-actions.webp";

export const Route = createFileRoute("/my/competitions/$id")({
  component: CompetitionDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const competition = getCachedCompetitions()?.find(
        (entry) => entry.id === match.params.id,
      );

      return competition?.name;
    },
    breadcrumbInfo: CompetitionDetailBreadcrumbInfo,
  },
});

function CompetitionDetailLayoutPage() {
  return <Outlet />;
}

function CompetitionDetailBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO"] }],
        [
          {
            keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO_2"],
            image: competitionDetail,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO_3"],
            image: competitionDetailViewModes,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO_4"],
            image: competitionDetailGear,
          },
          {
            keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO_5"],
            image: competitionDetailEditStack,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO_6"],
            image: competitionDetailActions,
          },
        ],
      ]}
    />
  );
}
