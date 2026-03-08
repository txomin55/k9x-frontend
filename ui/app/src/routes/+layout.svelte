<script>
    import "@/app.css";
    import {resolve} from "$app/paths";
    import CoreButton from "@lib/components/atoms/button/CoreButton.svelte";
    import {api, initApi} from "$lib/stores/api";
    import {auth} from "$lib/stores/auth";
    import {initI18n, locale, locales, ready, setLocale, t} from "$lib/stores/i18n";
    import {initNotifications} from "$lib/stores/notifications";
    import NewsVisualizer from "$lib/components/reload_prompt/NewsVisualizer.svelte";

    let {children} = $props();
    let isDark = $state(false);

    const toggleMode = () => {
        if (isDark) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
        isDark = !isDark;
    };

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            globalThis.location.reload();
        });
    }
    initNotifications();
    initI18n();
    initApi();
</script>

<div>
    <h1>My SvelteKit PWA</h1>
    {#if $ready}
        {$t("hello", {name: "txomin"})}
    {/if}
    <h2>USER -- {$auth.user ? $auth.user.getOwner() : "--NO"}</h2>
    <p>Mode</p>
    <CoreButton
            type="tertiary"
            onClick={toggleMode}
            label={isDark ? "Light" : "Dark"}
    />
    <p>LOCALES</p>
    <p>locale - {$locale}</p>
    <div>
        {#each locales as l}
            <CoreButton
                    type="primary"
                    onClick={() => setLocale(l)}
                    label={l}
            />
        {/each}
    </div>
    <nav>
        <a href={resolve("/")}>Landing</a>
        <a href={resolve("/home")}>Home</a>
    </nav>
    <NewsVisualizer/>
    <div>
        {#if $api}
            {#if $auth.loading}
                <p>..Verifying</p>
            {:else if !$auth.error}
                {@render children()}
            {/if}
        {:else}
            <p>Loading api....</p>
        {/if}
    </div>
</div>
