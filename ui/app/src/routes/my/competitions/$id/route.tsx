import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";

export const Route = createFileRoute("/my/competitions/$id")({
  component: CompetitionDetailLayoutPage,
  staticData: {
    breadcrumb: (match) => {
      const competition = getCachedCompetitions()?.find(
        (entry) => entry.id === match.params.id,
      );

      return competition?.name;
    },
  },
});

function CompetitionDetailLayoutPage() {
  return <Outlet />;
}
