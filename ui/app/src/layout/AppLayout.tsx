import { useLocation } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import "@/layout/styles.css";
import Drawer from "@/components/drawer/Drawer";
import CoreButton from "@lib/components/atoms/button/CoreButton";
import { auth } from "@/stores/auth";

const DESKTOP_BREAKPOINT = 1024;

export default function AppLayout(props) {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = createSignal(false);
  const [isNavOpen, setIsNavOpen] = createSignal(false);
  const [isDark, setIsDark] = createSignal(false);
  let previousDesktop = null;

  const toggleMode = () => {
    const nextIsDark = !isDark();
    document.documentElement.setAttribute(
      "data-theme",
      nextIsDark ? "dark" : "",
    );

    setIsDark(nextIsDark);
  };

  const syncViewport = () => {
    const desktop = globalThis.innerWidth > DESKTOP_BREAKPOINT;
    if (previousDesktop === null || previousDesktop !== desktop) {
      setIsNavOpen(desktop);
    }
    previousDesktop = desktop;
    setIsDesktop(desktop);
  };

  const OAUTH_STATE_KEY = "k9x_google_oauth_state";
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

  const logginButton = () => (
    <CoreButton type="ghost" onClick={handleGoogleLogin}>
      --Login
    </CoreButton>
  );

  onMount(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    syncViewport();
    globalThis.addEventListener("resize", syncViewport);
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", syncViewport);
  });

  createEffect(() => {
    const shouldLockScroll = !isDesktop() && isNavOpen();
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
  });

  createEffect(() => {
    location.pathname;
    if (!isDesktop()) {
      setIsNavOpen(false);
    }
  });

  onCleanup(() => {
    document.body.style.overflow = "";
  });

  return (
    <div class="app-layout">
      <div class="app-layout__navigation">
        <button
          class="app-layout__navigation-toggle"
          onClick={() => setIsNavOpen((open) => !open)}
          aria-expanded={isNavOpen()}
        >
          <span class="app-layout__navigation-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <Show when={auth().user} fallback={logginButton()}>
          {auth().user.getOwner()}
        </Show>
      </div>

      <div class="app-layout__wrapper">
        <Show when={!isDesktop() && isNavOpen()}>
          <button
            class="app-layout__backdrop"
            onClick={() => setIsNavOpen(false)}
          />
        </Show>

        <Drawer
          isDesktop={isDesktop()}
          isNavOpen={isNavOpen()}
          isDark={isDark()}
          onToggleMode={toggleMode}
        />

        <main class="app-layout__content">{props.children}</main>
      </div>
    </div>
  );
}
