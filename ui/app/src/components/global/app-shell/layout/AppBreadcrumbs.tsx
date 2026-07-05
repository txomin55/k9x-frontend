import { useMatches, useNavigate } from "@tanstack/solid-router";
import { Component, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";
import AtomBreadcrumbs from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs";
import { resolveBreadcrumb } from "@/utils/router/breadcrumbs";
import { queryClient } from "@/utils/http/query-client";
import InfoIcon from "@/components/common/info-icon/InfoIcon";

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

  const infoComponent = createMemo<Component | null>(() => {
    const list = matches();

    for (let i = list.length - 1; i >= 0; i--) {
      const info = list[i].staticData?.breadcrumbInfo;
      if (info) return info;
    }

    return null;
  });

  const info = createMemo(() => {
    const component = infoComponent();

    return component
      ? { trigger: <InfoIcon />, content: <Dynamic component={component} /> }
      : null;
  });

  return (
    <div class="app-layout__breadcrumbs" hidden={breadcrumbs().length === 0}>
      <AtomBreadcrumbs
        crumbs={breadcrumbs()}
        onNavigate={(route) => void navigate({ to: route as never })}
        info={info()}
      />
    </div>
  );
}
