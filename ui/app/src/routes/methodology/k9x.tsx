import { createFileRoute } from "@tanstack/solid-router";
import K9xMethodologyPage from "@/features/methodology/K9xMethodologyPage";

export const Route = createFileRoute("/methodology/k9x")({
  component: K9xMethodologyPage,
});
