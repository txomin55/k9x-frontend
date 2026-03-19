import { Title } from "@solidjs/meta";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, Match, onMount, Switch } from "solid-js";
import { AppRoutePath } from "@/components/router/paths";
import {
  clearCachedUserData,
  fetchCachedUserData,
} from "@/services/fetch_user_data/fetchUserData";
import {
  GOOGLE_OAUTH_STATE_KEY,
  GOOGLE_SILENT_OAUTH_MESSAGE_TYPE,
} from "@/services/google_auth/googleAuth";
import { useLogin } from "@/services/do_login/doLogin";
import { setUser } from "@/stores/auth";
import { resolveAppPath } from "@/utils/routes/app-paths";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

function readCallbackParams() {
  const stored = globalThis.sessionStorage.getItem(CALLBACK_PARAMS_KEY);
  if (stored) {
    globalThis.sessionStorage.removeItem(CALLBACK_PARAMS_KEY);
    return stored;
  }

  return globalThis.location.search;
}

export default function AuthCallbackRoute() {
  const navigate = useNavigate();
  const [status, setStatus] = createSignal("pending");
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
      clearCachedUserData();
      setUser(await fetchCachedUserData());
      globalThis.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);

      setStatus("loaded");

      navigate({ to: AppRoutePath.HOME as "/", replace: true });
    };

    await runCallback();
  });

  return (
    <>
      <Title>Auth Callback</Title>
      <Switch>
        <Match when={status() === "loading" || status() === "pending"}>
          <p>--Autenticando con Google...</p>
        </Match>
        <Match when={status() === "loaded"}>
          <p>--Autenticado. Redirigiendo...</p>
        </Match>
      </Switch>
    </>
  );
}
