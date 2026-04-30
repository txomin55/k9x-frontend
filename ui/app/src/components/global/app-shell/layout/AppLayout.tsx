import { useLocation } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import Navigation from "@/components/global/app-shell/layout/navigation/Navigation";
import AppBreadcrumbs from "@/components/global/app-shell/layout/AppBreadcrumbs";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import { useOffline } from "@/stores/network/network";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import NavigationUserMenu from "@/components/global/app-shell/layout/navigation/NavigationUserMenu";
import AtomPopover from "@lib/components/atoms/popover/AtomPopover";
import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import OrganizerForm from "@/components/global/app-shell/layout/navigation/OrganizerForm";
import { isDark, setIsDark } from "@/stores/theme/theme";

const DESKTOP_BREAKPOINT = 720;

export default function AppLayout(props: ParentProps) {
  const location = useLocation();
  const user = useAuthUser();
  const { isOffline } = useOffline();

  const [isDesktop, setIsDesktop] = createSignal(false);
  const [isNavOpen, setIsNavOpen] = createSignal(false);
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

  const [openOrganizerForm, setOpenOrganizerForm] = createSignal(false);

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
    if (!isDesktop() || location().pathname === "/") {
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
        <Show when={isOffline()}>
          <span>--Offline</span>
        </Show>
        <Show when={user()} fallback={loginButton()}>
          {(currentUser) => (
            <div class="app-layout__actions">
              <Show when={!currentUser().organizer}>
                <AtomDialog
                  closeButtonText="--Close dialog"
                  content={<OrganizerForm />}
                  onOpenChange={setOpenOrganizerForm}
                  open={openOrganizerForm()}
                  title="--Organizer request"
                  trigger={
                    <AtomButton type={BUTTON_TYPES.GHOST}>
                      --Want to be organizer?
                    </AtomButton>
                  }
                />
              </Show>
              <AtomPopover
                trigger={
                  <div class="app-layout__user-img">
                    <ProfileImage
                      src={currentUser().image}
                      fallback={currentUser().name.slice(0, 2)}
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
            </div>
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
