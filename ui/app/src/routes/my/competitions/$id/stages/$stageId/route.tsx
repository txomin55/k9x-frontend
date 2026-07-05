import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { useI18n } from "@/stores/i18n/i18n";

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
  const i18n = useI18n();

  return <p>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.BREADCRUMB_INFO")}</p>;
}
