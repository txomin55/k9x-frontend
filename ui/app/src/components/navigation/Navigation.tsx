import CoreButton from "@lib/components/atoms/button/CoreButton";
import { Link } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/router/paths";
import { clearAuth, useAuthUser } from "@/stores/auth";
import { locales, setLocale, useLocale } from "@/stores/i18n";
import { queryClient } from "@/utils/http/query-client";
import "@/components/navigation/styles.css";
import { For, Show } from "solid-js";

export default function Navigation(props) {
  const user = useAuthUser();
  const locale = useLocale();

  const handleLogout = () => {
    queryClient.clear();
    clearAuth();
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  return (
    <aside
      class="navigation__sidebar"
      classList={{
        "navigation__sidebar--desktop": props.isDesktop,
        "navigation__sidebar--mobile": !props.isDesktop,
        "navigation__sidebar--open": props.isNavOpen,
      }}
      id={props.id}
    >
      <div class="navigation__sidebar-panel">
        <nav class="navigation__sidebar-panel--navigation">
          <Link to={AppRoutePath.HOME as "/"}>--Competitions</Link>
          <Show when={user()}>
            <Link to={AppRoutePath.MY_COMPETITIONS as never}>
              --My competitions
            </Link>
          </Show>
        </nav>
        <div class="navigation__controls">
          <div class="navigation-tools">
            <div class="navigation-tools__group">
              <p>--Mode</p>
              <CoreButton type="accent" onClick={props.onToggleMode}>
                {props.isDark ? "Light" : "Dark"}
              </CoreButton>
            </div>

            <div class="navigation-tools__group">
              <p>--LOCALES</p>
              <p>--locale - {locale()}</p>
              <div class="navigation-tools__locales">
                <For each={locales}>
                  {(nextLocale) => (
                    <CoreButton
                      type="primary"
                      onClick={() => setLocale(nextLocale)}
                    >
                      {nextLocale}
                    </CoreButton>
                  )}
                </For>
              </div>

              <Show when={user()}>
                <CoreButton type="primary" onClick={handleLogout}>
                  Logout
                </CoreButton>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
