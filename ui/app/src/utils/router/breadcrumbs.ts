import type { AnyRouteMatch } from "@tanstack/solid-router";
import i18n from "i18next";

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

  return i18n.t(breadcrumb);
};
