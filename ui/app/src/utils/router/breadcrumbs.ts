import type { AnyRouteMatch } from "@tanstack/solid-router";
import i18n from "i18next";

export type AppBreadcrumbResult = { label: string; route?: string };

export type AppBreadcrumbValue =
  | string
  | ((
      match: AnyRouteMatch,
    ) => string | null | undefined | AppBreadcrumbResult);

declare module "@tanstack/solid-router" {
  interface StaticDataRouteOption {
    breadcrumb?: AppBreadcrumbValue;
  }
}

export const resolveBreadcrumb = (
  breadcrumb: AppBreadcrumbValue | undefined,
  match: AnyRouteMatch,
): AppBreadcrumbResult | null => {
  if (!breadcrumb) return null;

  if (typeof breadcrumb === "function") {
    const result = breadcrumb(match);
    if (!result) return null;
    return typeof result === "string" ? { label: result } : result;
  }

  return { label: i18n.t(breadcrumb) };
};
