import CoreButton from "@lib/components/atoms/button/CoreButton";
import { A } from "@solidjs/router";
import { locale, locales, setLocale } from "@/stores/i18n";
import { auth, setUser } from "@/stores/auth";
import "@/components/drawer/styles.css";
import { For, Show } from "solid-js";

export default function Drawer(props) {
  const handleLogout = () => {
    setUser(null);
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  return (
    <aside
      class="drawer__sidebar"
      classList={{
        "drawer__sidebar--desktop": props.isDesktop,
        "drawer__sidebar--mobile": !props.isDesktop,
        "drawer__sidebar--open": props.isNavOpen,
      }}
      id={props.id}
    >
      <div class="drawer__sidebar-panel">
        <nav class="drawer__sidebar-panel--navigation">
          <A href="/">--Competitions</A>
          <Show when={auth().user}>
            <A href="/my-competitions">--My competitions</A>
          </Show>
        </nav>
        <div class="drawer__controls">
          <div class="drawer-tools">
            <div class="drawer-tools__group">
              <p>Mode</p>
              <CoreButton type="accent" onClick={props.onToggleMode}>
                {props.isDark ? "Light" : "Dark"}
              </CoreButton>
            </div>

            <div class="drawer-tools__group">
              <p>LOCALES</p>
              <p>locale - {locale()}</p>
              <div class="drawer-tools__locales">
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

              <CoreButton type="primary" onClick={handleLogout}>
                Logout
              </CoreButton>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
