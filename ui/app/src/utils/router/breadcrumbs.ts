import type { AnyRouteMatch } from "@tanstack/solid-router";

export type AppBreadcrumbValue =
  | string
  | ((match: AnyRouteMatch) => string | null | undefined);

declare module "@tanstack/solid-router" {
  interface StaticDataRouteOption {
    breadcrumb?: AppBreadcrumbValue;
  }
}

export const resolveBreadcrumbLabel = (
  breadcrumb: AppBreadcrumbValue | undefined,
  match: AnyRouteMatch,
) => {
  if (!breadcrumb) return null;

  if (typeof breadcrumb === "function") {
    return breadcrumb(match) ?? null;
  }

  return breadcrumb;
};
