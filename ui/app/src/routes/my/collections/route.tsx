import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

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
  return <BreadcrumbInfoSlides slides={[[{ keys: ["MY.COLLECTIONS.BREADCRUMB_INFO"] }]]} />;
}
