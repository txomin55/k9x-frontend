import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedEventName } from "@/services/fetch-stages/fetchStages";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import stageEventResponsive from "@/assets/breadcrumb-info/stage-event-responsive.webp";
import stageEventViewModes from "@/assets/breadcrumb-info/stage-event-view-modes.webp";
import stageEventHeader from "@/assets/breadcrumb-info/stage-event-header.webp";
import stageEventInfo from "@/assets/breadcrumb-info/stage-event-info.webp";
import stageEventCompetitorCard from "@/assets/breadcrumb-info/stage-event-competitor-card.webp";
import stageEventScoreDetail from "@/assets/breadcrumb-info/stage-event-score-detail.webp";
import stageEventIcons from "@/assets/breadcrumb-info/stage-event-icons.webp";

export const Route = createFileRoute("/stages/$id/events/$eventId")({
  component: StageEventLayoutPage,
  staticData: {
    breadcrumb: (match) =>
      getCachedEventName(match.params.id, match.params.eventId),
    breadcrumbInfo: StageEventBreadcrumbInfo,
  },
});

function StageEventLayoutPage() {
  return <Outlet />;
}

function StageEventBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO"] }],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_2"],
            image: stageEventResponsive,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_3"],
            image: stageEventViewModes,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_4"],
            image: stageEventHeader,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_5"],
            image: stageEventInfo,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_6"],
            image: stageEventCompetitorCard,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_7"],
            image: stageEventScoreDetail,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_DETAIL.BREADCRUMB_INFO_8"],
            image: stageEventIcons,
          },
        ],
      ]}
    />
  );
}
