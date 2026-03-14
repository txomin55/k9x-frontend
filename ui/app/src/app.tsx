import "@/app.css";
import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onCleanup, onMount, Show } from "solid-js";
import NewsVisualizer from "@/components/news_visualizer/NewsVisualizer";
import { api, initApi } from "@/stores/api";
import { auth } from "@/stores/auth";
import { initI18n, ready, t } from "@/stores/i18n";
import { initNotifications } from "@/stores/notifications";
import { getBasePath, resolveAppPath } from "@/utils/app-paths";
import { warmAnimalIconsInBackground } from "@/utils/service_worker/native_features/offline_load/animal-icons";
import AppLayout from "@/layout/AppLayout";

function AppShell(props) {
  let cancelAnimalIconWarmup = null;

  onMount(async () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        globalThis.location.reload();
      });
    }

    await initNotifications();
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
      <AppLayout>
        <div class="app-shell">
          <h1>My Solid PWA</h1>
          <Show when={ready()}>{t("hello", { name: "txomin" })}</Show>
          <h2>USER -- {auth().user ? auth().user.getOwner() : "--NO"}</h2>
          <NewsVisualizer />
          <div>
            <Show when={api()} fallback={<p>Loading api....</p>}>
              {props.children}
            </Show>
          </div>
        </div>
      </AppLayout>
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
