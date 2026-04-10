import { createRootRoute } from "@tanstack/solid-router";
import AppShell from "@/components/global/app-shell/AppShell";

export const Route = createRootRoute({
  component: AppShell,
  notFoundComponent: () => <p>--Page not found.</p>,
});
