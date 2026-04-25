import { createFileRoute, useParams } from "@tanstack/solid-router";

export const Route = createFileRoute(
  "/stages/$id/events/$eventId/classification",
)({
  component: EventClassificationPage,
});

function EventClassificationPage() {
  const params = useParams({
    from: "/stages/$id/events/$eventId/classification",
  });

  return (
    <div>
      Event {params().eventId} classification for stage {params().id}
    </div>
  );
}
