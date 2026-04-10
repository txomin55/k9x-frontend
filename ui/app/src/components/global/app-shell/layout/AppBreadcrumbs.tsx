import { Link, useMatches } from "@tanstack/solid-router";
import { For, createMemo } from "solid-js";
import { resolveBreadcrumbLabel } from "@/utils/router/breadcrumbs";

type BreadcrumbItem = {
  href: string;
  label: string;
};

export default function AppBreadcrumbs() {
  const matches = useMatches();
  const breadcrumbs = createMemo<BreadcrumbItem[]>(() =>
    matches()
      .map((match) => {
        const label = resolveBreadcrumbLabel(match.staticData?.breadcrumb, match);

        if (!label) return null;

        return {
          href: match.pathname,
          label,
        };
      })
      .filter((breadcrumb): breadcrumb is BreadcrumbItem => breadcrumb !== null),
  );

  return (
    <nav
      class="app-layout__breadcrumbs"
      aria-label="Breadcrumb"
      hidden={breadcrumbs().length === 0}
    >
      <ol class="app-layout__breadcrumbs-list">
        <For each={breadcrumbs()}>
          {(breadcrumb, index) => {
            const isCurrent = () => index() === breadcrumbs().length - 1;

            return (
              <li class="app-layout__breadcrumbs-item">
                {isCurrent() ? (
                  <span
                    class="app-layout__breadcrumbs-current"
                    aria-current="page"
                  >
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.href}
                    class="app-layout__breadcrumbs-link"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </li>
            );
          }}
        </For>
      </ol>
    </nav>
  );
}
