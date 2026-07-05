import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/stages")({
  component: StagesLayoutPage,
  staticData: {
    breadcrumb: "STAGES.BREADCRUMB",
    breadcrumbInfo: StagesBreadcrumbInfo,
  },
});

function StagesLayoutPage() {
  return <Outlet />;
}

function StagesBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("STAGES.BREADCRUMB_INFO")}</p>;
}
