import { createFileRoute } from "@tanstack/solid-router";
import ObdxMethodologyPage from "@/features/methodology/ObdxMethodologyPage";

export const Route = createFileRoute("/methodology/obdx")({
  component: ObdxMethodologyPage,
  staticData: {
    breadcrumb: "METHODOLOGY.OBDX.BRAND",
  },
});
