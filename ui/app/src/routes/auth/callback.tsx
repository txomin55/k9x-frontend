import { Title } from "@solidjs/meta";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal, For, Match, onMount, Switch } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import "../styles.css";
import {
  clearCachedUserData,
  fetchCachedUserData,
} from "@/services/secured/fetch-user-data/fetchUserData";
import {
  GOOGLE_OAUTH_STATE_KEY,
  POST_LOGIN_REDIRECT_KEY,
} from "@/utils/google-auth/googleAuth";
import { useLogin } from "@/services/secured/do-login/doLogin";
import { setUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { clearLocalFirstQueryCache } from "@/utils/local-first/query_snapshots/localFirstQueryCache";
import { clearLocalFirstData } from "@/utils/local-first/storage/localFirstDatabase";
import { logger } from "@/utils/logger/logger";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmOfflineBundleInBackground } from "@/utils/service-worker/offline_bundle/warmOfflineBundle";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function readCallbackParams() {
  const stored = globalThis.sessionStorage.getItem(CALLBACK_PARAMS_KEY);
  if (stored) {
    globalThis.sessionStorage.removeItem(CALLBACK_PARAMS_KEY);
    return stored;
  }

  return globalThis.location.search;
}

function readPostLoginRedirect() {
  const stored = globalThis.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  globalThis.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

  if (stored && stored.startsWith("/") && !stored.startsWith("//")) {
    return stored;
  }

  return AppRoutePath.HOME;
}

function AuthCallbackSkeleton() {
  return (
    <section class="landing-page" aria-busy="true">
      <AtomSkeleton variant="rectangular" width="var(--unit-20)" height="var(--unit-5)" />

      <div class="landing-page__hero">
        <AtomSkeleton height="var(--unit-3)" width="70%" />
        <div class="landing-page__lead">
          <AtomSkeleton count={2} />
          <AtomSkeleton width="60%" />
        </div>
        <div class="landing-page__actions">
          <AtomSkeleton variant="rectangular" width="var(--unit-16)" height="var(--unit-5)" radius="999px" />
        </div>
      </div>

      <div class="landing-page__latest">
        <div class="landing-page__latest-header">
          <AtomSkeleton width="var(--unit-16)" height="var(--unit-2)" />
        </div>
        <ul class="landing-page__latest-list">
          <For each={Array.from({ length: 3 })}>
            {() => (
              <li class="landing-page__latest-item">
                <AtomSkeleton variant="rectangular" />
              </li>
            )}
          </For>
        </ul>
      </div>

      <div class="landing-page__grid">
        <For each={Array.from({ length: 3 })}>
          {() => (
            <article class="landing-page__card">
              <AtomSkeleton width="40%" />
              <AtomSkeleton width="80%" height="var(--unit-2)" />
              <AtomSkeleton count={2} />
            </article>
          )}
        </For>
      </div>
    </section>
  );
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = createSignal("pending");
  const [errorMessage, setErrorMessage] = createSignal("");
  const login = useLogin();
  const i18n = useI18n();

  onMount(async () => {
    const runCallback = async () => {
      const params = new URLSearchParams(readCallbackParams());
      const code = params.get("code");

      if (!code) {
        throw new Error("Missing OAuth code");
      }

      if (globalThis.location.search) {
        globalThis.history.replaceState(
          {},
          document.title,
          resolveAppPath(AppRoutePath.AUTH_CALLBACK),
        );
      }

      setStatus("loading");

      const token = await login.mutateAsync({ code });
      globalThis.localStorage.setItem("k9x_access_token", token);
      clearLocalFirstQueryCache();
      await clearLocalFirstData();
      clearCachedUserData();
      setUser(await fetchCachedUserData());
      globalThis.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      if (!import.meta.env.DEV) {
        warmOfflineBundleInBackground({ force: true });
      }

      setStatus("loaded");

      await navigate({ to: readPostLoginRedirect() as "/", replace: true });
    };

    try {
      await runCallback();
    } catch (error) {
      logger.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : i18n.t("AUTH_CALLBACK.AUTHENTICATION_FAILED"),
      );
    }
  });

  return (
    <>
      <Title>{i18n.t("AUTH_CALLBACK.TITLE")}</Title>
      <Switch>
        <Match when={status() === "loading" || status() === "pending"}>
          <AuthCallbackSkeleton />
        </Match>
        <Match when={status() === "loaded"}>
          <AuthCallbackSkeleton />
        </Match>
        <Match when={status() === "error"}>
          <p>{`${i18n.t("AUTH_CALLBACK.AUTHENTICATION_ERROR")}: ${errorMessage()}`}</p>
        </Match>
      </Switch>
    </>
  );
}
