import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import dogsFilter from "@/assets/breadcrumb-info/dogs-filter.webp";
import dogsViewModes from "@/assets/breadcrumb-info/dogs-view-modes.webp";
import dogsAdd from "@/assets/breadcrumb-info/dogs-add.webp";
import dogsCard from "@/assets/breadcrumb-info/dogs-card.webp";
import dogsOrganizerFields from "@/assets/breadcrumb-info/dogs-organizer-fields.webp";

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
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.DOGS.BREADCRUMB_INFO"] }],
        [{ keys: ["MY.DOGS.BREADCRUMB_INFO_2"], image: dogsFilter }],
        [{ keys: ["MY.DOGS.BREADCRUMB_INFO_3"], image: dogsViewModes }],
        [{ keys: ["MY.DOGS.BREADCRUMB_INFO_4"], image: dogsAdd }],
        [{ keys: ["MY.DOGS.BREADCRUMB_INFO_5"], image: dogsCard }],
        [
          {
            keys: ["MY.DOGS.BREADCRUMB_INFO_6"],
            image: dogsOrganizerFields,
          },
        ],
      ]}
    />
  );
}
