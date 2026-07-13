import { Link, MetaProvider } from "@solidjs/meta";
import { Outlet, useLocation } from "@tanstack/solid-router";
import { createEffect, onMount, Show } from "solid-js";
import AppLayout from "@/components/global/app-shell/layout/AppLayout";
import Toast from "@/components/global/toast/Toast";
import NotificationGuard from "@/providers/notifications/NotificationsInit";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmOfflineBundleInBackground } from "@/utils/service-worker/offline_bundle/warmOfflineBundle";
import { pruneStaleQuerySnapshots } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { prefetchCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { prefetchAllDogs, prefetchDogs, prefetchOwnedDogs } from "@/services/secured/dog-crud/dogCrud";
import { prefetchJudges } from "@/services/secured/judge-crud/judgeCrud";
import { prefetchCollections } from "@/services/secured/collection-crud/collectionCrud";
import { prefetchCountries } from "@/services/secured/country-crud/countryCrud";
import { prefetchBreeds } from "@/services/secured/breed-crud/breedCrud";
import { useI18n } from "@/stores/i18n/i18n";
import { fetchUserIfAuthenticated, useAuthUser } from "@/stores/auth/auth";
import { initNetworkStore } from "@/stores/network/network";
import "./styles.css";

export default function AppShell() {
  const i18n = useI18n();
  const user = useAuthUser();

  const location = useLocation();

  onMount(async () => {
    initNetworkStore();

    await i18n.init();
    await fetchUserIfAuthenticated(location().pathname);

    if (user()) {
      warmOfflineBundleInBackground();
      void pruneStaleQuerySnapshots();
    }
  });

  createEffect(() => {
    if (user()) {
      if (user()?.organizer) {
        void prefetchCompetitions({
          refetchOnMount: false,
          gcTime: 2 * 60 * 1000,
        });
        void prefetchJudges({
          refetchOnMount: false,
          gcTime: 2 * 60 * 1000,
        });
        void prefetchAllDogs({
          refetchOnMount: false,
          gcTime: 2 * 60 * 1000,
        });
      }
      void prefetchDogs({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchOwnedDogs({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchCollections({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchCountries({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchBreeds({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
    }
  });

  return (
    <MetaProvider>
      <Link rel="manifest" href={resolveAppPath("/manifest.webmanifest")} />
      <Show when={i18n.ready()} fallback={<p>--loading</p>}>
        <NotificationGuard>
          <AppLayout>
            <div class="app-shell">
              <Outlet />
            </div>
            <Toast />
          </AppLayout>
        </NotificationGuard>
      </Show>
    </MetaProvider>
  );
}
