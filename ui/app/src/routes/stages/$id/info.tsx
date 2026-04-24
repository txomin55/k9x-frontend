import { createFileRoute, useParams } from "@tanstack/solid-router";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoPage,
});

function StageInfoPage() {
  const params = useParams({ from: "/stages/$id/info" });

  return <div>Stage {params().id} info</div>;
}
