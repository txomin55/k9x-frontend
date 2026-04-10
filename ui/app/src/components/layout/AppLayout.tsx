import { useLocation } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import Navigation from "@/components/navigation/Navigation";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth";
import "@/components/layout/styles.css";
import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import AtomPopover from "@lib/components/atoms/popover/AtomPopover";
import NavigationUserMenu from "@/components/navigation/NavigationUserMenu";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";

const DESKTOP_BREAKPOINT = 1024;

export default function AppLayout(props: ParentProps) {
  const location = useLocation();
  const user = useAuthUser();
  const [isDesktop, setIsDesktop] = createSignal(false);
  const [isNavOpen, setIsNavOpen] = createSignal(false);
  const [isDark, setIsDark] = createSignal(false);
  let previousDesktop = false;

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

  const systemDefaultIsDark = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

  const loginButton = () => (
    <AtomButton
      type={BUTTON_TYPES.ACCENT}
      onClick={startGoogleInteractiveLogin}
    >
      --Login
    </AtomButton>
  );

  onMount(() => {
    document.documentElement.setAttribute(
      "data-theme",
      systemDefaultIsDark ? "dark" : "",
    );

    setIsDark(systemDefaultIsDark);

    syncViewport();
    globalThis.addEventListener("resize", syncViewport);
    mediaQuery.addEventListener("change", toggleMode);
  });

  createEffect(() => {
    const shouldLockScroll = !isDesktop() && isNavOpen();
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
  });

  createEffect(() => {
    location().pathname;
    if (!isDesktop()) {
      setIsNavOpen(false);
    }
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", syncViewport);
    mediaQuery.removeEventListener("change", toggleMode);
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
          <span class="app-layout__navigation-toggle-icon">
            <span />
            <span />
            <span />
          </span>
        </button>

        <Show when={user()} fallback={loginButton()}>
          {(currentUser) => (
            <AtomPopover
              trigger={
                <div class="app-layout__user-img">
                  <ProfileImage
                    src={currentUser().image}
                    fallback={currentUser().initials}
                  />
                </div>
              }
              content={
                <div class="app-layout__user-img--menu">
                  <NavigationUserMenu
                    isDark={isDark()}
                    onToggleMode={toggleMode}
                  />
                </div>
              }
            />
          )}
        </Show>
      </div>

      <div class="app-layout__wrapper">
        <Show when={!isDesktop() && isNavOpen()}>
          <button
            class="app-layout__backdrop"
            onClick={() => setIsNavOpen(false)}
          />
        </Show>

        <Navigation isDesktop={isDesktop()} isNavOpen={isNavOpen()} />

        <main class="app-layout__content">
          <AppBreadcrumbs />
          {props.children}
        </main>
      </div>
    </div>
  );
}
