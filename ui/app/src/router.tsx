import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/solid-router";
import AppShell from "@/components/router/AppShell";
import AuthCallbackRoute from "@/routes/auth/callback";
import IndexRoute from "@/routes/index";
import MyCompetitionsRoute from "@/routes/my-competitions/index";
import { AppRoutePath, trimLeadingSlash } from "@/components/router/paths";
import { getBasePath } from "@/utils/routes/app-paths";

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: () => <p>--Page not found.</p>,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AppRoutePath.HOME,
  component: IndexRoute,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: trimLeadingSlash(AppRoutePath.AUTH_CALLBACK),
  component: AuthCallbackRoute,
});

const myCompetitionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: trimLeadingSlash(AppRoutePath.MY_COMPETITIONS),
  component: MyCompetitionsRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authCallbackRoute,
  myCompetitionsRoute,
]);

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
