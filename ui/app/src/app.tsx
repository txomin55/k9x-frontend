import "@/app.css";
import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onCleanup, onMount, Show } from "solid-js";
import NewsVisualizer from "@/components/news_visualizer/NewsVisualizer";
import { api, initApi } from "@/stores/api";
import { auth } from "@/stores/auth";
import { initI18n, ready, t } from "@/stores/i18n";
import { getBasePath, resolveAppPath } from "@/utils/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service_worker/native_features/offline_load/animal-icons";
import AppLayout from "@/layout/AppLayout";
import NotificationGuard from "@/guards/notifications/NotificationsGuard";
import AuthGuard from "@/guards/auth/AuthGuard";

function AppShell(props) {
  let cancelAnimalIconWarmup = null;

  onMount(async () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        globalThis.location.reload();
      });
    }

    await initI18n();
    await initApi();

    cancelAnimalIconWarmup = warmAnimalIconsInBackground();
  });

  onCleanup(() => {
    cancelAnimalIconWarmup?.();
  });

  return (
    <MetaProvider>
      <Title>Dog Trainer App</Title>
      <Link rel="manifest" href={resolveAppPath("/manifest.webmanifest")} />
      <Show when={api()} fallback={<p>Loading api....</p>}>
        <AuthGuard>
          <NotificationGuard>
            <AppLayout>
              <div class="app-shell">
                <h1>My Solid PWA</h1>
                <Show when={ready()}>{t("hello", { name: "txomin" })}</Show>
                <h2>USER -- {auth().user ? auth().user.getOwner() : "--NO"}</h2>
                <NewsVisualizer />
                <div>{props.children}</div>
              </div>
            </AppLayout>
          </NotificationGuard>
        </AuthGuard>
      </Show>
    </MetaProvider>
  );
}

export default function App() {
  return (
    <Router root={AppShell} base={getBasePath()}>
      <FileRoutes />
    </Router>
  );
}
