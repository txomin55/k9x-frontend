import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { getCachedPublicDogName } from "@/services/fetch-dogs/fetchDogs";

export const Route = createFileRoute("/dogs/$identification")({
  component: PublicDogDetailLayoutPage,
  staticData: {
    // Null until the name is known, so the crumb shows its loading state instead of the raw
    // identification, which is a chip number and reads as noise.
    breadcrumb: (match) => {
      const label = getCachedPublicDogName(match.params.identification);
      return label ? { label } : null;
    },
  },
});

function PublicDogDetailLayoutPage() {
  return <Outlet />;
}
