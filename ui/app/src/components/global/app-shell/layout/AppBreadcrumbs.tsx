import { useMatches, useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, onCleanup } from "solid-js";
import AtomBreadcrumbs from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs";
import { resolveBreadcrumb } from "@/utils/router/breadcrumbs";
import { queryClient } from "@/utils/http/query-client";

type BreadcrumbItem = {
  route: string;
  text: string;
};

export default function AppBreadcrumbs() {
  const matches = useMatches();
  const navigate = useNavigate();

  const [cacheVersion, setCacheVersion] = createSignal(0);
  const unsubscribe = queryClient
    .getQueryCache()
    .subscribe(() => setCacheVersion((version) => version + 1));
  onCleanup(unsubscribe);

  const breadcrumbs = createMemo<BreadcrumbItem[]>(() => {
    cacheVersion();

    return matches()
      .map((match) => {
        const breadcrumb = resolveBreadcrumb(
          match.staticData?.breadcrumb,
          match,
        );

        if (!breadcrumb) return null;

        return {
          route: breadcrumb.route ?? match.pathname,
          text: breadcrumb.label,
        };
      })
      .filter(
        (breadcrumb): breadcrumb is BreadcrumbItem => breadcrumb !== null,
      );
  });

  return (
    <div class="app-layout__breadcrumbs" hidden={breadcrumbs().length === 0}>
      <AtomBreadcrumbs
        crumbs={breadcrumbs()}
        onNavigate={(route) => void navigate({ to: route as never })}
      />
    </div>
  );
}
