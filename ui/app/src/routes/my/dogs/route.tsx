import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

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
  return <BreadcrumbInfoSlides slides={[[{ keys: ["MY.DOGS.BREADCRUMB_INFO"] }]]} />;
}
