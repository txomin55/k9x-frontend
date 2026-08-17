import { createSignal } from "solid-js";

const THEME_STORAGE_KEY = "k9x_theme";

const readStoredTheme = (): boolean | undefined => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) return;

  try {
    const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // ignore: theme persistence must never break the app
  }
};

const persistTheme = (nextIsDark: boolean) => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) return;

  try {
    globalThis.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextIsDark ? "dark" : "light",
    );
  } catch {
    // ignore: theme persistence must never break the app
  }
};

const [isDark, setIsDarkSignal] = createSignal(readStoredTheme() ?? false);

const applyTheme = (nextIsDark: boolean) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
      "data-theme",
      nextIsDark ? "dark" : "",
    );
  }

  setIsDarkSignal(nextIsDark);
};

const setIsDark = (nextIsDark: boolean) => {
  applyTheme(nextIsDark);
  persistTheme(nextIsDark);
};

export { applyTheme, isDark, readStoredTheme, setIsDark, THEME_STORAGE_KEY };
