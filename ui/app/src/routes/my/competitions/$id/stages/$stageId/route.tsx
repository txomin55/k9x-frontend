import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import competitionStageDetail from "@/assets/breadcrumb-info/competition-stage-detail.webp";
import competitionStageTabs from "@/assets/breadcrumb-info/competition-stage-tabs.webp";
import competitionStageNotifications from "@/assets/breadcrumb-info/competition-stage-notifications.webp";
import competitionStageViewModes from "@/assets/breadcrumb-info/competition-stage-view-modes.webp";
import editModeGear from "@/assets/breadcrumb-info/edit-mode-gear.webp";
import editModeStack from "@/assets/breadcrumb-info/edit-mode-stack.webp";
import competitionStageActions from "@/assets/breadcrumb-info/competition-stage-actions.webp";
import competitionStageCardActions from "@/assets/breadcrumb-info/competition-stage-card-actions.webp";

export const Route = createFileRoute("/my/competitions/$id/stages/$stageId")({
  component: CompetitionStageLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const competition = getCachedCompetitions()?.find(
        (entry) => entry.id === match.params.id,
      );
      const stage = competition?.stages?.find(
        (entry) => entry.id === match.params.stageId,
      );

      return stage?.name;
    },
    breadcrumbInfo: CompetitionStageBreadcrumbInfo,
  },
});

function CompetitionStageLayoutPage() {
  return <Outlet />;
}

function CompetitionStageBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO"] }],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_2"],
            image: competitionStageDetail,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_TABS"],
            image: competitionStageTabs,
          },
        ],
        [
          {
            keys: [
              "MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_NOTIFICATIONS",
              "MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_NOTIFICATIONS_2",
            ],
            image: competitionStageNotifications,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_3"],
            image: competitionStageViewModes,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_4"],
            image: editModeGear,
          },
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_5"],
            image: editModeStack,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_6"],
            image: competitionStageActions,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO_7"],
            image: competitionStageCardActions,
          },
        ],
      ]}
    />
  );
}
