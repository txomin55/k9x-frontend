<script>
  import {goto} from "$app/navigation";
  import {resolve} from "$app/paths";
  import {api} from "$lib/stores/api";
  import {setUser} from "$lib/stores/auth";
  import fetchUserData from "$lib/services/fetch_user_data/fetchUserData.js";

  const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";
    const OAUTH_STATE_KEY = "k9x_google_oauth_state";
    const SILENT_OAUTH_MESSAGE_TYPE = "k9x_google_oauth";

    let status = $state("pending");
    let error = $state(null);
    let started = $state(false);

    const readCallbackParams = () => {
        const stored = globalThis.sessionStorage.getItem(CALLBACK_PARAMS_KEY);
        if (stored) {
            globalThis.sessionStorage.removeItem(CALLBACK_PARAMS_KEY);
            return stored;
        }
        return globalThis.location.search;
    };

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
        const oauthError = params.get("error");
        if (oauthError) {
            status = "error";
            error = oauthError;
            return;
        }

        const code = params.get("code");
        const returnedState = params.get("state");
        const expectedState = globalThis.sessionStorage.getItem(OAUTH_STATE_KEY);

        if (!code) {
            status = "missing_code";
            return;
        }

        if (!expectedState || returnedState !== expectedState) {
            status = "state_mismatch";
            return;
        }

        if (globalThis.location.search) {
            const cleanUrl = `${globalThis.location.origin}${globalThis.location.pathname}`;
            globalThis.history.replaceState({}, document.title, cleanUrl);
        }

        if (!$api) {
            const waitForApi = () =>
                new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        unsubscribe();
                        reject(new Error("API timeout"));
                    }, 8000);

                    const unsubscribe = api.subscribe((value) => {
                        if (value) {
                            clearTimeout(timeoutId);
                            unsubscribe();
                            resolve(value);
                        }
                    });
                });

            try {
                await waitForApi();
            } catch (e) {
                status = "error";
                error = "API not ready";
                return;
            }
        }

        if (!$api?.login || !$api?.getUserData) {
            status = "error";
            error = "API not ready";
            return;
        }

        status = "loading";

        try {
            const token = await $api.login(null, {idToken: code});
            globalThis.localStorage.setItem("k9x_access_token", token);

            await fetchUserData($api.getUserData, (d) => {
                setUser(d);
            });

            globalThis.sessionStorage.removeItem(OAUTH_STATE_KEY);
            await goto(resolve("/home"), {replaceState: true});
        } catch (e) {
            status = "error";
            error = e?.message || "Login failed";
        }
    };

    $effect(() => {
        if (typeof window !== "undefined" && !started) {
            started = true;
            runCallback();
        }
    });
</script>

{#if status === "loading" || status === "pending"}
    <p>Autenticando con Google...</p>
{:else if status === "state_mismatch"}
    <p>Estado OAuth invalido. Reintenta el login</p>
{:else if status === "missing_code"}
    <p>No se recibio el codigo de autenticacion.</p>
{:else if status === "error"}
    <p>Error de autenticacion: {String(error)}</p>
{:else}
    <p>Autenticado. Redirigiendo...</p>
{/if}
