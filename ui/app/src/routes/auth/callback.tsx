import { Title } from "@solidjs/meta";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal, Match, onMount, Switch } from "solid-js";
import { AppRoutePath } from "@/components/app_shell/paths";
import {
  clearCachedUserData,
  fetchCachedUserData,
} from "@/services/api/fetch_user_data/fetchUserData";
import {
  GOOGLE_OAUTH_STATE_KEY,
  GOOGLE_SILENT_OAUTH_MESSAGE_TYPE,
} from "@/utils/google_auth/googleAuth";
import { useLogin } from "@/services/api/do_login/doLogin";
import { setUser } from "@/stores/auth";
import { clearLocalFirstQueryCache } from "@/utils/local_first/query_snapshots/localFirstQueryCache";
import { clearLocalFirstData } from "@/utils/local_first/storage/localFirstDatabase";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { warmOfflineBundle } from "@/utils/service_worker/offline_bundle/warmOfflineBundle";

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

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = createSignal("pending");
  const [errorMessage, setErrorMessage] = createSignal("");
  const login = useLogin();

  onMount(async () => {
    const runCallback = async () => {
      const isIframe =
        globalThis.self && globalThis.top && globalThis.self !== globalThis.top;

      if (isIframe) {
        globalThis.parent.postMessage(
          {
            type: GOOGLE_SILENT_OAUTH_MESSAGE_TYPE,
            search: globalThis.location.search,
          },
          globalThis.location.origin,
        );
        return;
      }

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

      const token = await login.mutateAsync({ idToken: code });
      globalThis.localStorage.setItem("k9x_access_token", token);
      clearLocalFirstQueryCache();
      await clearLocalFirstData();
      clearCachedUserData();
      setUser(await fetchCachedUserData());
      globalThis.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      await warmOfflineBundle({ force: true });

      setStatus("loaded");

      await navigate({ to: AppRoutePath.HOME as "/", replace: true });
    };

    try {
      await runCallback();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "--Authentication failed.",
      );
    }
  });

  return (
    <>
      <Title>--Auth Callback</Title>
      <Switch>
        <Match when={status() === "loading" || status() === "pending"}>
          <p>--Autenticando con Google...</p>
        </Match>
        <Match when={status() === "loaded"}>
          <p>--Autenticado. Redirigiendo...</p>
        </Match>
        <Match when={status() === "error"}>
          <p>{`--Error de autenticacion: ${errorMessage()}`}</p>
        </Match>
      </Switch>
    </>
  );
}
