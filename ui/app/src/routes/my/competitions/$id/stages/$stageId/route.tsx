import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/api/competition-crud/competitionCrud";

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
  },
});

function CompetitionStageLayoutPage() {
  return <Outlet />;
}
