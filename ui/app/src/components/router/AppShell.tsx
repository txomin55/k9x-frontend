import { Link, MetaProvider } from "@solidjs/meta";
import { Outlet, useLocation, useNavigate } from "@tanstack/solid-router";
import { onCleanup, onMount, Show } from "solid-js";
import AppLayout from "@/components/layout/AppLayout";
import NewsVisualizer from "@/components/news_visualizer/NewsVisualizer";
import NotificationGuard from "@/providers/notifications/NotificationsInit";
import { auth, fetchUserIfAuthenticated } from "@/stores/auth";
import { initI18n, ready, t } from "@/stores/i18n";
import { resolveAppPath } from "@/utils/routes/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service_worker/native_features/offline_load/animal-icons";
import "@/app.css";

export default function AppShell() {
  let cancelAnimalIconWarmup: (() => void) | undefined;

  const location = useLocation();
  const navigate = useNavigate();

  onMount(async () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        globalThis.location.reload();
      });
    }

    await initI18n();
    await fetchUserIfAuthenticated(location().pathname, (path) =>
      navigate({ to: path as never }),
    );

    cancelAnimalIconWarmup = warmAnimalIconsInBackground();
  });

  onCleanup(() => {
    cancelAnimalIconWarmup?.();
  });

  return (
    <MetaProvider>
      <Link rel="manifest" href={resolveAppPath("/manifest.webmanifest")} />
      <Show when={ready()} fallback={<p>Loading app....</p>}>
        <NotificationGuard>
          <AppLayout>
            <div class="app-shell">
              <h1>--My Solid PWA</h1>
              <p>{t("hello", { name: "txomin" })}</p>
              <h2>--USER -- {auth().user?.getOwner() ?? "--NO"}</h2>
              <NewsVisualizer />
              <Outlet />
            </div>
          </AppLayout>
        </NotificationGuard>
      </Show>
    </MetaProvider>
  );
}
