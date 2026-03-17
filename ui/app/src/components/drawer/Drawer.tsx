import CoreButton from "@lib/components/atoms/button/CoreButton";
import { A } from "@solidjs/router";
import { locale, locales, setLocale } from "@/stores/i18n";
import { auth } from "@/stores/auth";
import "@/components/drawer/styles.css";
import { For, Show } from "solid-js";

export default function Drawer(props) {
  return (
    <aside
      class="app-layout__sidebar"
      classList={{
        "app-layout__sidebar--desktop": props.isDesktop,
        "app-layout__sidebar--mobile": !props.isDesktop,
        "app-layout__sidebar--open": props.isNavOpen,
      }}
      id={props.id}
    >
      <div class="app-layout__sidebar-panel">
        <nav class="app-navigation">
          <A href="/">--Competitions</A>
          <Show when={auth().user}>
            <A href="/my-competitions">--My competitions</A>
          </Show>
        </nav>
        <div class="app-layout__controls">
          <div class="app-layout-tools">
            <div class="app-layout-tools__group">
              <p>Mode</p>
              <CoreButton type="accent" onClick={props.onToggleMode}>
                {props.isDark ? "Light" : "Dark"}
              </CoreButton>
            </div>

            <div class="app-layout-tools__group">
              <p>LOCALES</p>
              <p>locale - {locale()}</p>
              <div class="app-layout-tools__locales">
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
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
