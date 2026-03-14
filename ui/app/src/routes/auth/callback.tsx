import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, Match, onMount, Switch } from "solid-js";
import fetchUserData from "@/services/fetch_user_data/fetchUserData";
import { setUser } from "@/stores/auth";
import { resolveAppPath } from "@/utils/app-paths";
import doLogin from "@/services/do_login/doLogin";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";
const OAUTH_STATE_KEY = "k9x_google_oauth_state";
const SILENT_OAUTH_MESSAGE_TYPE = "k9x_google_oauth";

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

  onMount(async () => {
    const runCallback = async () => {
      const isIframe =
        globalThis.self && globalThis.top && globalThis.self !== globalThis.top;

      if (isIframe) {
        globalThis.parent.postMessage(
          {
            type: SILENT_OAUTH_MESSAGE_TYPE,
            search: globalThis.location.search,
          },
          globalThis.location.origin,
        );
        return;
      }

      const params = new URLSearchParams(readCallbackParams());
      const code = params.get("code");

      if (globalThis.location.search) {
        globalThis.history.replaceState(
          {},
          document.title,
          resolveAppPath("/auth/callback"),
        );
      }

      setStatus("loading");

      const token = await doLogin({ idToken: code });
      globalThis.localStorage.setItem("k9x_access_token", token);
      setUser(await fetchUserData());
      globalThis.sessionStorage.removeItem(OAUTH_STATE_KEY);

      setStatus("loaded");

      navigate("/home", { replace: true });
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
