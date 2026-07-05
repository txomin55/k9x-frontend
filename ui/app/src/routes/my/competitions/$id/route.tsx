import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { useI18n } from "@/stores/i18n/i18n";

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
  const i18n = useI18n();

  return <p>{i18n.t("MY.COMPETITIONS.DETAIL.BREADCRUMB_INFO")}</p>;
}
