import { useMatches, useNavigate } from "@tanstack/solid-router";
import { createMemo } from "solid-js";
import AtomBreadcrumbs from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs";
import { resolveBreadcrumbLabel } from "@/utils/router/breadcrumbs";

type BreadcrumbItem = {
  route: string;
  text: string;
};

export default function AppBreadcrumbs() {
  const matches = useMatches();
  const navigate = useNavigate();
  const breadcrumbs = createMemo<BreadcrumbItem[]>(() =>
    matches()
      .map((match) => {
        const label = resolveBreadcrumbLabel(
          match.staticData?.breadcrumb,
          match,
        );

        if (!label) return null;

        return {
          route: match.pathname,
          text: label,
        };
      })
      .filter(
        (breadcrumb): breadcrumb is BreadcrumbItem => breadcrumb !== null,
      ),
  );

  return (
    <div class="app-layout__breadcrumbs" hidden={breadcrumbs().length === 0}>
      <AtomBreadcrumbs
        crumbs={breadcrumbs()}
        onNavigate={(route) => void navigate({ to: route as never })}
      />
    </div>
  );
}
