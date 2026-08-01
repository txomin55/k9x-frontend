import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedStageName } from "@/services/fetch-stages/fetchStages";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import stageDetailTabs from "@/assets/breadcrumb-info/stage-detail-tabs.webp";
import stageDetailEventCard from "@/assets/breadcrumb-info/stage-detail-event-card.webp";
import stageDetailCompetitors from "@/assets/breadcrumb-info/stage-detail-competitors.webp";
import enrollButton from "@/assets/breadcrumb-info/enroll-button.webp";

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
        [{ keys: ["COMMON.ENROLL_BUTTON_HINT"], image: enrollButton }],
        [
          {
            keys: ["STAGES.DETAIL.BREADCRUMB_INFO_4"],
            image: stageDetailCompetitors,
          },
        ],
      ]}
    />
  );
}
