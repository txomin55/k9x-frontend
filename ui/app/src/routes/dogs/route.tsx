import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import dogsFilter from "@/assets/breadcrumb-info/dogs-filter.webp";
import dogsViewModes from "@/assets/breadcrumb-info/dogs-view-modes.webp";

export const Route = createFileRoute("/dogs")({
  component: DogsLayoutPage,
  staticData: {
    breadcrumb: "DOGS.BREADCRUMB",
    breadcrumbInfo: DogsBreadcrumbInfo,
  },
});

function DogsLayoutPage() {
  return <Outlet />;
}

function DogsBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["DOGS.BREADCRUMB_INFO", "DOGS.BREADCRUMB_INFO_2"] }],
        [{ keys: ["DOGS.BREADCRUMB_INFO_3"], image: dogsFilter }],
        [{ keys: ["DOGS.BREADCRUMB_INFO_4"], image: dogsViewModes }],
      ]}
    />
  );
}
