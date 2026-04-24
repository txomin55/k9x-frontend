import { createFileRoute, useParams } from "@tanstack/solid-router";

export const Route = createFileRoute("/events/$id/qualifications")({
  component: EventQualificationsPage,
});

function EventQualificationsPage() {
  const params = useParams({ from: "/events/$id/qualifications" });

  return <div>Event {params().id} qualifications</div>;
}
