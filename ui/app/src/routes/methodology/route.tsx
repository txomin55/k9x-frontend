import { createFileRoute, Outlet } from "@tanstack/solid-router";
import i18n from "i18next";

export const Route = createFileRoute("/methodology")({
  component: MethodologyLayoutPage,
  staticData: {
    breadcrumb: () => ({
      label: i18n.t("GLOBAL.NAVIGATION.LANDING"),
      route: "/",
    }),
  },
});

function MethodologyLayoutPage() {
  return <Outlet />;
}
