import { Link, MetaProvider } from "@solidjs/meta";
import { Outlet, useLocation, useNavigate } from "@tanstack/solid-router";
import { createEffect, onCleanup, onMount, Show } from "solid-js";
import AppLayout from "@/components/global/app-shell/layout/AppLayout";
import NotificationGuard from "@/providers/notifications/NotificationsInit";

import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service-worker/native_features/offline_load/animal-icons";
import { warmOfflineBundleInBackground } from "@/utils/service-worker/offline_bundle/warmOfflineBundle";
import { prefetchCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { prefetchConfigurations } from "@/services/secured/configurations/configurations";
import { prefetchDogs } from "@/services/secured/dog-crud/dogCrud";
import { prefetchJudges } from "@/services/secured/judge-crud/judgeCrud";
import { prefetchCollections } from "@/services/secured/collection-crud/collectionCrud";
import { useI18n } from "@/stores/i18n/i18n";
import { fetchUserIfAuthenticated, useAuthUser } from "@/stores/auth/auth";
import { initNetworkStore } from "@/stores/network/network";
import "./styles.css";

export default function AppShell() {
  const i18n = useI18n();
  const user = useAuthUser();
  let cancelAnimalIconWarmup: () => void;

  const location = useLocation();
  const navigate = useNavigate();

  onMount(async () => {
    initNetworkStore();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        globalThis.location.reload();
      });
    }

    await i18n.init();
    await fetchUserIfAuthenticated(location().pathname, (path) =>
      navigate({ to: path }),
    );

    if (user()) {
      warmOfflineBundleInBackground();
    }
    cancelAnimalIconWarmup = warmAnimalIconsInBackground();
  });

  createEffect(() => {
    if (user()) {
      void prefetchCompetitions({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchConfigurations({
        refetchOnMount: false,
        staleTime: Number.POSITIVE_INFINITY,
      });
      void prefetchDogs({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchJudges({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchCollections({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
    }
  });

  onCleanup(() => {
    cancelAnimalIconWarmup?.();
  });

  return (
    <MetaProvider>
      <Link rel="manifest" href={resolveAppPath("/manifest.webmanifest")} />
      <Show
        when={i18n.ready()}
        fallback={<p>{i18n.t("GLOBAL.LOADING_APP")}</p>}
      >
        <NotificationGuard>
          <AppLayout>
            <div class="app-shell">
              <Outlet />
            </div>
          </AppLayout>
        </NotificationGuard>
      </Show>
    </MetaProvider>
  );
}
