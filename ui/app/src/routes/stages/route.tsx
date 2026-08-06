import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import stagesViewModes from "@/assets/breadcrumb-info/stages-view-modes.webp";
import stagesCardStage from "@/assets/breadcrumb-info/stages-card-stage.webp";
import stagesCardEvent from "@/assets/breadcrumb-info/stages-card-event.webp";
import enrollButton from "@/assets/breadcrumb-info/enroll-button.webp";
import classificationButton from "@/assets/breadcrumb-info/classification-button.webp";
import stagesFilters from "@/assets/breadcrumb-info/stages-filters.webp";
import stagesMapStatus from "@/assets/breadcrumb-info/stages-map-status.webp";
import stagesCardBell from "@/assets/breadcrumb-info/stages-card-bell.webp";
import stagesCardBellActive from "@/assets/breadcrumb-info/stages-card-bell-active.webp";

export const Route = createFileRoute("/stages")({
  component: StagesLayoutPage,
  staticData: {
    breadcrumb: "STAGES.BREADCRUMB",
    breadcrumbInfo: StagesBreadcrumbInfo,
  },
});

function StagesLayoutPage() {
  return <Outlet />;
}

function StagesBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["STAGES.BREADCRUMB_INFO", "STAGES.BREADCRUMB_INFO_2"] }],
        [{ keys: ["STAGES.BREADCRUMB_INFO_3"], image: stagesViewModes }],
        [{ keys: ["STAGES.BREADCRUMB_INFO_4"], image: stagesCardStage }],
        [{ keys: ["STAGES.BREADCRUMB_INFO_5"], image: stagesCardEvent }],
        [
          { keys: ["COMMON.ENROLL_BUTTON_HINT"], image: enrollButton },
          {
            keys: ["COMMON.CLASSIFICATION_BUTTON_HINT"],
            image: classificationButton,
          },
        ],
        [
          { keys: ["STAGES.BREADCRUMB_INFO_BELL"], image: stagesCardBell },
          {
            keys: ["STAGES.BREADCRUMB_INFO_BELL_ACTIVE"],
            image: stagesCardBellActive,
          },
        ],
        [{ keys: ["STAGES.BREADCRUMB_INFO_6"], image: stagesFilters }],
        [{ keys: ["STAGES.BREADCRUMB_INFO_7"], image: stagesMapStatus }],
      ]}
    />
  );
}
