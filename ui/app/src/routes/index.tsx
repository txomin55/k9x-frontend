import { useLocation, useNavigate } from "@tanstack/solid-router";
import { createEffect, Show } from "solid-js";
import { useDogs } from "@/services/fetch_dogs/fetchDogs";
import logo from "@/assets/logo.svg";
import { AppRoutePath } from "@/components/router/paths";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedDogs = useDogs({
    staleTime: 30_000,
  });

  createEffect(async () => {
    const search = location().searchStr;
    if (!search) return;

    const params = new URLSearchParams(search);
    if (params.get("code")) {
      globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
      await navigate({
        to: AppRoutePath.AUTH_CALLBACK as never,
        replace: true,
      });
    }
  });

  return (
    <div class="Landing">
      <Show when={fetchedDogs.data}>
        <pre>{JSON.stringify(fetchedDogs.data, null, 2)}</pre>
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
