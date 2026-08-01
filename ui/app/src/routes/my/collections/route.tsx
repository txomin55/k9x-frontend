import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import collectionsCard from "@/assets/breadcrumb-info/collections-card.webp";

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
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.COLLECTIONS.BREADCRUMB_INFO"] }],
        [{ keys: ["MY.COLLECTIONS.BREADCRUMB_INFO_2"], image: collectionsCard }],
      ]}
    />
  );
}
