import { createRouter } from "@tanstack/solid-router";
import { routeTree } from "@/routeTree.gen";
import { getBasePath } from "@/utils/paths/app-paths";

export const router = createRouter({
  routeTree,
  basepath: getBasePath(),
  scrollRestoration: true,
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}
