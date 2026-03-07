import { lazy } from "react";

const LANDING = "LANDING";
const HOME = "HOME";
const AUTH_CALLBACK = "AUTH_CALLBACK";

export const ROUTES = {
  [LANDING]: "/",
  [HOME]: "/home",
  [AUTH_CALLBACK]: "/auth/callback",
};

export default [
  {
    path: ROUTES.LANDING,
    element: lazy(() => import("@/pages/landing/LandingPage")),
  },
  {
    path: ROUTES.AUTH_CALLBACK,
    element: lazy(() => import("@/pages/auth_callback/AuthCallback")),
  },
  {
    path: ROUTES.HOME,
    element: lazy(() => import("@/pages/home/HomePage")),
  },
];
