import CoreButton from "@lib/components/atoms/button/CoreButton";
import { A, useLocation } from "@solidjs/router";
import { locale, locales, setLocale } from "@/stores/i18n";
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import "@/layout/styles.css";

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
      <button
        class="app-layout__toggle"
        type="button"
        onClick={() => setIsNavOpen((open) => !open)}
        aria-expanded={isNavOpen()}
        aria-controls="app-layout-navigation"
        aria-label={isNavOpen() ? "Cerrar navegacion" : "Abrir navegacion"}
      >
        <span class="app-layout__toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span class="app-layout__toggle-text">
          {isNavOpen() ? "Cerrar" : "Menu"}
        </span>
      </button>

      <div class="app-layout__shell">
        <Show when={!isDesktop() && isNavOpen()}>
          <button
            class="app-layout__backdrop"
            type="button"
            aria-label="Cerrar navegacion"
            onClick={() => setIsNavOpen(false)}
          />
        </Show>

        <aside
          class="app-layout__sidebar"
          classList={{
            "app-layout__sidebar--desktop": isDesktop(),
            "app-layout__sidebar--mobile": !isDesktop(),
            "app-layout__sidebar--open": isNavOpen(),
          }}
          id="app-layout-navigation"
        >
          <div class="app-layout__sidebar-panel">
            <nav class="app-navigation">
              <A href="/">Landing</A>
              <A href="/home">Home</A>
            </nav>
            <div class="app-layout__controls">
              <div class="app-layout-tools">
                <div class="app-layout-tools__group">
                  <p>Mode</p>
                  <CoreButton
                    type="tertiary"
                    onClick={toggleMode}
                    label={isDark() ? "Light" : "Dark"}
                  />
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
                          label={nextLocale}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="app-layout__content">{props.children}</main>
      </div>
    </div>
  );
}
