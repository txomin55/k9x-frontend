import { useLocation, useNavigate } from "@tanstack/solid-router";
import { createEffect, createSignal, Show } from "solid-js";
import CoreButton from "@lib/components/atoms/button/CoreButton";
import fetchDogs from "@/services/fetch_dogs/fetchDogs";
import logo from "@/assets/logo.svg";
import { AppRoutePath } from "@/components/router/paths";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dogsResult, setDogsResult] = createSignal(null);
  const [lastSearch, setLastSearch] = createSignal("");

  const handleFetchDogs = async () => {
    setDogsResult(await fetchDogs());
  };

  createEffect(() => {
    const search = location().searchStr;
    if (!search || search === lastSearch()) return;

    const params = new URLSearchParams(search);
    if (params.get("code")) {
      setLastSearch(search);
      globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
      navigate({
        to: AppRoutePath.AUTH_CALLBACK as never,
        replace: true,
      });
      return;
    }

    setLastSearch(search);
  });

  return (
    <div class="Landing">
      <CoreButton type="primary" onClick={handleFetchDogs}>
        --Cargar perros
      </CoreButton>

      <Show when={dogsResult()}>
        <pre>{JSON.stringify(dogsResult(), null, 2)}</pre>
      </Show>

      <div class="header">
        <img src={logo} class="logo" alt="logo" />
        <p>
          --Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          class="link"
          href="https://www.solidjs.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          --Learn Solid
        </a>
      </div>
    </div>
  );
}
