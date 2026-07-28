import { useLocation } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import { createEffect, createSignal, lazy, onCleanup, onMount, Show, Suspense } from "solid-js";
import Navigation from "@/components/global/app-shell/layout/navigation/Navigation";
import AppBreadcrumbs from "@/components/global/app-shell/layout/AppBreadcrumbs";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useAuthLoading, useAuthUser } from "@/stores/auth/auth";
import { useOffline } from "@/stores/network/network";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomPopover from "@lib/components/atoms/popover/AtomPopover";
import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import WalkthroughDialog from "@/components/global/app-shell/layout/walkthrough/WalkthroughDialog";
import FloatingShareButton from "@/components/common/floating-share-button/FloatingShareButton";
import { isDark, setIsDark } from "@/stores/theme/theme";
import { useI18n } from "@/stores/i18n/i18n";
import { useDeviceType } from "@/utils/media-query/useDeviceType";

const NavigationUserMenu = lazy(
  () =>
    import("@/components/global/app-shell/layout/navigation/NavigationUserMenu"),
);
const OrganizerForm = lazy(
  () => import("@/components/global/app-shell/layout/navigation/OrganizerForm"),
);
const PendingCollectionsDialog = lazy(
  () => import("@/components/global/app-shell/layout/PendingCollectionsDialog"),
);
const NotificationsDialog = lazy(
  () => import("@/components/global/app-shell/layout/NotificationsDialog"),
);

export default function AppLayout(props: ParentProps) {
  const location = useLocation();
  const user = useAuthUser();
  const authLoading = useAuthLoading();
  const { isOffline } = useOffline();
  const i18n = useI18n();

  const device = useDeviceType();
  const isDesktop = () => device() === "laptop";
  const [isNavOpen, setIsNavOpen] = createSignal(false);

  const toggleMode = () => {
    const nextIsDark = !isDark();
    document.documentElement.setAttribute(
      "data-theme",
      nextIsDark ? "dark" : "",
    );

    setIsDark(nextIsDark);
  };

  createEffect(() => {
    setIsNavOpen(isDesktop());
  });

  const systemDefaultIsDark = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

  const loginButton = () => (
    <span
      class="app-layout__login"
      classList={{
        "app-layout__login--skeleton atom-skeleton atom-skeleton--animated":
          authLoading(),
      }}
    >
      <AtomButton
        type={BUTTON_TYPES.ACCENT}
        disabled={authLoading()}
        onClick={startGoogleInteractiveLogin}
      >
        {i18n.t("GLOBAL.APP_LAYOUT.LOGIN")}
      </AtomButton>
    </span>
  );

  const [openOrganizerForm, setOpenOrganizerForm] = createSignal(false);

  onMount(() => {
    document.documentElement.setAttribute(
      "data-theme",
      systemDefaultIsDark ? "dark" : "",
    );

    setIsDark(systemDefaultIsDark);

    mediaQuery.addEventListener("change", toggleMode);
  });

  createEffect(() => {
    const pathname = location().pathname;
    if (!isDesktop() || pathname === "/") {
      setIsNavOpen(false);
    }
  });

  onCleanup(() => {
    mediaQuery.removeEventListener("change", toggleMode);
  });

  return (
    <div class="app-layout">
      <WalkthroughDialog />
      <div class="app-layout__navigation">
        <button
          class="app-layout__navigation-toggle"
          onClick={() => setIsNavOpen((open) => !open)}
          aria-expanded={isNavOpen()}
          aria-label={isNavOpen() ? "Close navigation" : "Open navigation"}
        >
          <span class="app-layout__navigation-toggle-icon">
            <span />
            <span />
            <span />
          </span>
        </button>
        <Show when={isOffline()}>
          <span>{i18n.t("GLOBAL.APP_LAYOUT.OFFLINE")}</span>
        </Show>
        <Show when={user()} fallback={loginButton()}>
          {(currentUser) => (
            <div class="app-layout__actions">
              <Suspense fallback={null}>
                <PendingCollectionsDialog />
              </Suspense>
              <Suspense fallback={null}>
                <NotificationsDialog />
              </Suspense>
              <Show when={!currentUser().organizer}>
                <AtomDialog
                  closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
                  content={
                    <Suspense fallback={null}>
                      <OrganizerForm onClose={() => setOpenOrganizerForm(false)} />
                    </Suspense>
                  }
                  onOpenChange={setOpenOrganizerForm}
                  open={openOrganizerForm()}
                  title={i18n.t("GLOBAL.APP_LAYOUT.ORGANIZER_REQUEST")}
                  triggerClass="atom-dialog__trigger--ghost"
                  trigger={
                    <span>{i18n.t("GLOBAL.APP_LAYOUT.WANT_TO_BE_ORGANIZER")}</span>
                  }
                />
              </Show>
              <FloatingShareButton />
              <AtomPopover
                trigger={
                  <div class="app-layout__user-img">
                    <ProfileImage
                      src={currentUser().image}
                      alt={currentUser().name}
                      fallback={currentUser().name.slice(0, 2)}
                    />
                  </div>
                }
                content={
                  <div class="app-layout__user-img--menu">
                    <Suspense fallback={null}>
                      <NavigationUserMenu
                        isDark={isDark()}
                        onToggleMode={toggleMode}
                      />
                    </Suspense>
                  </div>
                }
              />
            </div>
          )}
        </Show>
      </div>

      <div class="app-layout__wrapper">
        <Show
          when={isDesktop()}
          fallback={
            <AtomDialog
              closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
              content={<Navigation />}
              onOpenChange={setIsNavOpen}
              open={isNavOpen()}
            />
          }
        >
          <aside
            class="navigation__sidebar navigation__sidebar--desktop"
            classList={{ "navigation__sidebar--open": isNavOpen() }}
          >
            <div class="navigation__sidebar-panel">
              <Navigation />
            </div>
          </aside>
        </Show>

        <main class="app-layout__content">
          <AppBreadcrumbs />
          {props.children}
        </main>
      </div>
    </div>
  );
}
