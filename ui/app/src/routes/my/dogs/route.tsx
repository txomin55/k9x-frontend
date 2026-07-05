import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/dogs")({
  component: MyDogsLayoutPage,
  staticData: {
    breadcrumb: "MY.DOGS.BREADCRUMB",
    breadcrumbInfo: MyDogsBreadcrumbInfo,
  },
});

function MyDogsLayoutPage() {
  return <Outlet />;
}

function MyDogsBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.DOGS.BREADCRUMB_INFO")}</p>;
}
