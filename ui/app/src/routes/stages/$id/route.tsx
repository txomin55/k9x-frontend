import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageName } from "@/services/fetch-stages/fetchStages";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import stageDetailTabs from "@/assets/breadcrumb-info/stage-detail-tabs.webp";
import stageDetailEventCard from "@/assets/breadcrumb-info/stage-detail-event-card.webp";
import stageDetailCompetitors from "@/assets/breadcrumb-info/stage-detail-competitors.webp";
import enrollButton from "@/assets/breadcrumb-info/enroll-button.webp";
import stageDetailPending from "@/assets/breadcrumb-info/stage-detail-pending.webp";
import classificationButton from "@/assets/breadcrumb-info/classification-button.webp";
import stageDetailNotifications from "@/assets/breadcrumb-info/stage-detail-notifications.webp";
import stageDetailRankings from "@/assets/breadcrumb-info/stage-detail-rankings.webp";

export const Route = createFileRoute("/stages/$id")({
  component: EventDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const label = getCachedStageName(match.params.id);
      return label
        ? { label, route: `/stages/${match.params.id}/info` }
        : null;
    },
    breadcrumbInfo: StageDetailBreadcrumbInfo,
  },
});

function EventDetailLayoutPage() {
  return <Outlet />;
}

function StageDetailBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["STAGES.DETAIL.BREADCRUMB_INFO"] }],
        [{ keys: ["STAGES.DETAIL.BREADCRUMB_INFO_2"], image: stageDetailTabs }],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_3"],
            image: stageDetailEventCard,
          },
        ],
        [
          { keys: ["COMMON.ENROLL_BUTTON_HINT"], image: enrollButton },
          {
            keys: ["COMMON.CLASSIFICATION_BUTTON_HINT"],
            image: classificationButton,
          },
        ],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_4"],
            image: stageDetailCompetitors,
          },
        ],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_5"],
            image: stageDetailPending,
          },
        ],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_RANKINGS"],
            image: stageDetailRankings,
          },
        ],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_NOTIFICATIONS"],
            image: stageDetailNotifications,
          },
        ],
      ]}
    />
  );
}
