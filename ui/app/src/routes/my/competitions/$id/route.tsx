import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

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
  return <BreadcrumbInfoSlides slides={[[{ keys: ["MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO"] }]]} />;
}
