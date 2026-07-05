import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/collections")({
  component: MyCollectionsLayoutPage,
  staticData: {
    breadcrumb: "MY.COLLECTIONS.BREADCRUMB",
    breadcrumbInfo: MyCollectionsBreadcrumbInfo,
  },
});

function MyCollectionsLayoutPage() {
  return <Outlet />;
}

function MyCollectionsBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.COLLECTIONS.BREADCRUMB_INFO")}</p>;
}
