<script>
    import "@/app.css";
    import {page} from "$app/state";
    import {resolve} from "$app/paths";
    import CoreButton from "@lib/components/atoms/button/CoreButton.svelte";
    import ReloadPrompt from "$lib/components/reload_prompt/ReloadPrompt.svelte";
    import {api, initApi} from "$lib/stores/api";
    import {auth, ensureAuthenticated} from "$lib/stores/auth";
    import {initI18n, locale, locales, ready, setLocale, t} from "$lib/stores/i18n";
    import {initNotifications} from "$lib/stores/notifications";

    let {children} = $props();
    let isDark = $state(false);

    const basePath = resolve("/").replace(/\/$/, "");

    const normalizePathname = (pathname) => {
        if (!basePath) return pathname || "/";
        if (pathname.startsWith(basePath)) {
            const stripped = pathname.slice(basePath.length);
            return stripped === "" ? "/" : stripped;
        }
        return pathname || "/";
    };

    const toggleMode = () => {
        if (isDark) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
        isDark = !isDark;
    };

    initNotifications();
    initI18n();
    initApi();

    const currentPath = $derived(() => normalizePathname(page.url.pathname));
    $effect(() => {
        if ($api) {
            ensureAuthenticated(currentPath);
        }
    });
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
    <ReloadPrompt/>
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
