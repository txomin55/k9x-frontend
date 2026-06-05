import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from "@tanstack/solid-router";
import { routeTree } from "@/routeTree.gen";
import { getBasePath } from "@/utils/paths/app-paths";

const parseSearchValue = (value: string) => {
  const first = value.charAt(0);
  if (first === "[" || first === "{") {
    return JSON.parse(value);
  }
  throw new Error("keep raw string");
};

export const router = createRouter({
  routeTree,
  basepath: getBasePath(),
  scrollRestoration: true,
  parseSearch: parseSearchWith(parseSearchValue),
  stringifySearch: stringifySearchWith(JSON.stringify),
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}
