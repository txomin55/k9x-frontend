import { Link, MetaProvider } from "@solidjs/meta";
import { Outlet, useLocation, useNavigate } from "@tanstack/solid-router";
import { createEffect, onCleanup, onMount, Show } from "solid-js";
import AppLayout from "@/components/global/app-shell/layout/AppLayout";
import NewsVisualizer from "@/components/global/news-visualizer/NewsVisualizer";
import NotificationGuard from "@/providers/notifications/NotificationsInit";
import { fetchUserIfAuthenticated, useAuthUser } from "@/stores/auth";
import { useI18n } from "@/stores/i18n";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service-worker/native_features/offline_load/animal-icons";
import { warmOfflineBundleInBackground } from "@/utils/service-worker/offline_bundle/warmOfflineBundle";
import { prefetchCompetitions } from "@/services/api/competition-crud/competitionCrud";
import { prefetchDogs } from "@/services/api/dog-crud/dogCrud";
import { prefetchJudges } from "@/services/api/judge-crud/judgeCrud";

export default function AppShell() {
  const i18n = useI18n();
  const user = useAuthUser();
  let cancelAnimalIconWarmup: () => void;

  const location = useLocation();
  const navigate = useNavigate();

  onMount(async () => {
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
      void prefetchDogs({
        refetchOnMount: false,
        gcTime: 2 * 60 * 1000,
      });
      void prefetchJudges({
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
      <Show when={i18n.ready()} fallback={<p>--Loading app....</p>}>
        <NotificationGuard>
          <AppLayout>
            <div class="app-shell">
              <NewsVisualizer />
              <Outlet />
            </div>
          </AppLayout>
        </NotificationGuard>
      </Show>
    </MetaProvider>
  );
}
