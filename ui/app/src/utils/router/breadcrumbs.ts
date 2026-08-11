import type { AnyRouteMatch } from "@tanstack/solid-router";
import type { Component } from "solid-js";
import i18n from "i18next";

export type AppBreadcrumbResult = { label: string; route?: string };

export type AppBreadcrumbValue =
  | string
  | ((
      match: AnyRouteMatch,
    ) =>
      | string
      | null
      | undefined
      | AppBreadcrumbResult
      | AppBreadcrumbResult[]);

export type AppBreadcrumbInfoValue = Component;

declare module "@tanstack/solid-router" {
  interface StaticDataRouteOption {
    breadcrumb?: AppBreadcrumbValue;
    breadcrumbInfo?: AppBreadcrumbInfoValue;
    /**
     * Starts the trail at this route: crumbs from ancestor routes are dropped. For pages whose full route
     * chain would read as noise, like the public event rankings under the whole stage hierarchy.
     */
    breadcrumbRoot?: boolean;
  }
}

/**
 * Resolves to a list because a single route may contribute more than one crumb — a static label plus a
 * dynamic detail item. Most routes resolve to one.
 */
export const resolveBreadcrumbs = (
  breadcrumb: AppBreadcrumbValue | undefined,
  match: AnyRouteMatch,
): AppBreadcrumbResult[] | null => {
  if (!breadcrumb) return null;

  if (typeof breadcrumb === "function") {
    const result = breadcrumb(match);
    if (!result) return null;
    if (typeof result === "string") return [{ label: result }];
    return Array.isArray(result) ? result : [result];
  }

  return [{ label: i18n.t(breadcrumb) }];
};
