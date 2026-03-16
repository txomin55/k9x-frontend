import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import CoreButton from "@lib/components/atoms/button/CoreButton";
import fetchDogs from "@/services/fetch_dogs/fetchDogs";
import logo from "@/assets/logo.svg";
import { setUser } from "@/stores/auth";

const OAUTH_STATE_KEY = "k9x_google_oauth_state";
const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dogsResult, setDogsResult] = createSignal(null);
  const [lastSearch, setLastSearch] = createSignal("");

  const buildGoogleAuthUrl = () => {
    const state = crypto.randomUUID();
    globalThis.sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleGoogleLogin = () => {
    globalThis.location.assign(buildGoogleAuthUrl());
  };

  const handleLogout = () => {
    setUser(null);
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  const handleFetchDogs = async () => {
    setDogsResult(await fetchDogs());
  };

  createEffect(() => {
    const search = location.search;
    if (!search || search === lastSearch()) return;

    const params = new URLSearchParams(search);
    if (params.get("code")) {
      setLastSearch(search);
      globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
      navigate("/auth/callback", { replace: true });
      return;
    }

    setLastSearch(search);
  });

  return (
    <>
      <div class="Landing">
        <CoreButton
          type="primary"
          label="Haz login con Google"
          onClick={handleGoogleLogin}
        />
        <CoreButton type="secondary" label="Logout" onClick={handleLogout} />
        <CoreButton
          type="secondary"
          label="Cargar perros"
          onClick={handleFetchDogs}
        />

        <Show when={dogsResult()}>
          <pre>{JSON.stringify(dogsResult(), null, 2)}</pre>
        </Show>

        <div class="header">
          <img src={logo} class="logo" alt="logo" />
          <p>
            Edit <code>src/routes/index.tsx</code> and save to reload.
          </p>
          <a
            class="link"
            href="https://www.solidjs.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Solid
          </a>
        </div>
      </div>
    </>
  );
}
