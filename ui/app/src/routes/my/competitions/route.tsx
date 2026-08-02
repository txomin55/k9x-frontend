import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import competitionsCard from "@/assets/breadcrumb-info/competitions-card.webp";
import competitionsViewModes from "@/assets/breadcrumb-info/competitions-view-modes.webp";
import competitionsAdd from "@/assets/breadcrumb-info/competitions-add.webp";
import competitionsStatuses from "@/assets/breadcrumb-info/competitions-statuses.webp";

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
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.COMPETITIONS.BREADCRUMB_INFO"] }],
        [
          {
            keys: ["MY.COMPETITIONS.BREADCRUMB_INFO_2"],
            image: competitionsCard,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.BREADCRUMB_INFO_3"],
            image: competitionsViewModes,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.BREADCRUMB_INFO_4"],
            image: competitionsStatuses,
          },
        ],
        [
          {
            keys: ["MY.COMPETITIONS.BREADCRUMB_INFO_5"],
            image: competitionsAdd,
          },
        ],
      ]}
    />
  );
}
