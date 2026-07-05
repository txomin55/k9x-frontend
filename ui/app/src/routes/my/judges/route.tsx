import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/judges")({
  component: MyJudgesLayoutPage,
  staticData: {
    breadcrumb: "MY.JUDGES.BREADCRUMB",
    breadcrumbInfo: MyJudgesBreadcrumbInfo,
  },
});

function MyJudgesLayoutPage() {
  return <Outlet />;
}

function MyJudgesBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.JUDGES.BREADCRUMB_INFO")}</p>;
}
