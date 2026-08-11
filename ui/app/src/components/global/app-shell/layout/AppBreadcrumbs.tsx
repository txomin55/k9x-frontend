import { useMatches, useNavigate } from "@tanstack/solid-router";
import { Component, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";
import AtomBreadcrumbs from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs";
import { resolveBreadcrumbs } from "@/utils/router/breadcrumbs";
import { queryClient } from "@/utils/http/query-client";
import InfoIcon from "@/components/common/info-icon/InfoIcon";
import { useI18n } from "@/stores/i18n/i18n";

type BreadcrumbItem = {
  route: string;
  text: string;
  loading?: boolean;
};

export default function AppBreadcrumbs() {
  const matches = useMatches();
  const navigate = useNavigate();
  const i18n = useI18n();

  const [cacheVersion, setCacheVersion] = createSignal(0);
  const unsubscribe = queryClient
    .getQueryCache()
    .subscribe(() => setCacheVersion((version) => version + 1));
  onCleanup(unsubscribe);

  const breadcrumbs = createMemo<BreadcrumbItem[]>(() => {
    cacheVersion();

    const list = matches();

    // A breadcrumb root starts the trail over, dropping the ancestors' crumbs.
    let start = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].staticData?.breadcrumbRoot) {
        start = i;
        break;
      }
    }

    return list
      .slice(start)
      .flatMap((match): (BreadcrumbItem | null)[] => {
        const definition = match.staticData?.breadcrumb;

        if (!definition) return [null];

        const crumbs = resolveBreadcrumbs(definition, match);

        if (!crumbs) {
          return [
            {
              route: match.pathname,
              text: "",
              loading: true,
            },
          ];
        }

        return crumbs.map((crumb) => ({
          route: crumb.route ?? match.pathname,
          text: crumb.label,
        }));
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
      // A breadcrumb root drops the ancestors' crumbs, so their info would be about a page that is no
      // longer in the trail.
      if (list[i].staticData?.breadcrumbRoot) break;
    }

    return null;
  });

  const info = createMemo(() => {
    const component = infoComponent();

    return component
      ? {
          trigger: <InfoIcon />,
          content: () => <Dynamic component={component} />,
          title: i18n.t("COMMON.PAGE_INFORMATION"),
        }
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
