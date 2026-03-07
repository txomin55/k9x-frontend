<script>
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";
  import CoreButton from "@lib/components/atoms/button/CoreButton.svelte";
  import logo from "$lib/assets/logo.svg";
  import { api } from "$lib/stores/api";
  import fetchDogs from "$lib/services/fetch_dogs/fetchDogs.js";

  const OAUTH_STATE_KEY = "k9x_google_oauth_state";
  const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

  let dogsResult = $state(null);
  let lastSearch = $state("");

  const buildGoogleAuthUrl = () => {
    const redirectUri =
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      `${globalThis.location.origin}${resolve("/")}`;

    const state = crypto.randomUUID();
    globalThis.sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
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
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  const handleFetchDogs = async () => {
    if (!$api?.getDogs) return;
    dogsResult = await fetchDogs($api.getDogs, (d) => d);
  };

  $effect(() => {
    if (typeof window === "undefined") return;
    const search = page.url.search;
    if (search && search !== lastSearch) {
      const params = new URLSearchParams(search);
      if (params.get("code") || params.get("error")) {
        lastSearch = search;
        globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
        goto(resolve("/auth/callback"), { replaceState: true });
      } else {
        lastSearch = search;
      }
    }
  });
</script>

<div class="Landing">
  <CoreButton label="Haz login con Google" onClick={handleGoogleLogin} />
  <CoreButton label="Logout" onClick={handleLogout} />
  <CoreButton label="Cargar perros" onClick={handleFetchDogs} />

  {#if dogsResult}
    <pre>{JSON.stringify(dogsResult, null, 2)}</pre>
  {/if}

  <header class="header">
    <img src={logo} class="logo" alt="logo" />
    <p>
      Edit <code>src/routes/+page.svelte</code> and save to reload.
    </p>
    <a
      class="link"
        href="https://kit.svelte.dev"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn SvelteKit
    </a>
  </header>
</div>

<style>
  .Landing {
    text-align: center;
  }

  .logo {
    animation: logo-spin infinite 20s linear;
    height: 40vmin;
    pointer-events: none;
  }

  .header {
    background-color: black;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
  }

  .link {
    color: #b318f0;
  }

  @keyframes logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
