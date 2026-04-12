import { createRootRoute } from "@tanstack/solid-router";
import AppShell from "@/components/global/app-shell/AppShell";

export const Route = createRootRoute({
  component: AppShell,
  /*
  errorComponent: (props) => (
    <div>
      <h1>--Unexpected error</h1>
      <p>{String(props.error)}</p>
    </div>
  ),*/
  notFoundComponent: () => <p>--Page not found.</p>,
});
