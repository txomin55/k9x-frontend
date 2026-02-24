import { lazy } from "react";

const LANDING = "LANDING";
const HOME = "HOME";

export const ROUTES = {
  [LANDING]: "/",
  [HOME]: "/home",
};

export default [
  {
    path: ROUTES.LANDING,
    element: lazy(() => import("@/pages/landing/LandingPage")),
  },
  {
    path: ROUTES.HOME,
    element: lazy(() => import("@/pages/home/HomePage")),
  },
];
