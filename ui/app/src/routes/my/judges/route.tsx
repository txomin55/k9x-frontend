import { createFileRoute, Outlet } from "@tanstack/solid-router";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import judgesFilter from "@/assets/breadcrumb-info/judges-filter.webp";
import judgesViewModes from "@/assets/breadcrumb-info/judges-view-modes.webp";
import judgesAdd from "@/assets/breadcrumb-info/judges-add.webp";
import judgesCard from "@/assets/breadcrumb-info/judges-card.webp";

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
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["MY.JUDGES.BREADCRUMB_INFO"] }],
        [{ keys: ["MY.JUDGES.BREADCRUMB_INFO_2"], image: judgesFilter }],
        [{ keys: ["MY.JUDGES.BREADCRUMB_INFO_3"], image: judgesViewModes }],
        [{ keys: ["MY.JUDGES.BREADCRUMB_INFO_4"], image: judgesAdd }],
        [{ keys: ["MY.JUDGES.BREADCRUMB_INFO_5"], image: judgesCard }],
      ]}
    />
  );
}
