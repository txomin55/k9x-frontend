import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

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
  const i18n = useI18n();

  return <p>{i18n.t("MY.COMPETITIONS.BREADCRUMB_INFO")}</p>;
}
