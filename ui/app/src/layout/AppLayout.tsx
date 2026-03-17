import { useLocation } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import "@/layout/styles.css";
import Drawer from "@/components/drawer/Drawer";

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
        class="app-layout__navigation-toggle"
        onClick={() => setIsNavOpen((open) => !open)}
        aria-expanded={isNavOpen()}
        aria-label={isNavOpen() ? "Cerrar navegacion" : "Abrir navegacion"}
      >
        <span class="app-layout__navigation-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span class="app-layout__navigation-toggle-text">
          {isNavOpen() ? "--Cerrar" : "--Menu"}
        </span>
      </button>

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
