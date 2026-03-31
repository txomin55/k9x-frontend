import { Link, MetaProvider } from "@solidjs/meta";
import { Outlet, useLocation, useNavigate } from "@tanstack/solid-router";
import { onCleanup, onMount, Show } from "solid-js";
import AppLayout from "@/components/layout/AppLayout";
import NewsVisualizer from "@/components/news_visualizer/NewsVisualizer";
import NotificationGuard from "@/providers/notifications/NotificationsInit";
import { fetchUserIfAuthenticated, useAuthUser } from "@/stores/auth";
import { useI18n } from "@/stores/i18n";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service_worker/native_features/offline_load/animal-icons";
import { warmOfflineBundleInBackground } from "@/utils/service_worker/offline_bundle/warmOfflineBundle";

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
