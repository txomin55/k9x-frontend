import type { Decorator } from "@storybook/html";

export const DEFAULT_THEME = "light";
const DARK_THEME = "dark";

let managerObserver: MutationObserver | undefined;

function setDocumentTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
}

function getThemeFromExplicitGlobals(theme: unknown): string | undefined {
  return theme === DEFAULT_THEME || theme === DARK_THEME ? theme : undefined;
}

function isDarkColor(value: string): boolean | undefined {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "") {
    return undefined;
  }

  if (["dark", "black", "#000", "#000000"].includes(normalizedValue)) {
    return true;
  }

  if (["light", "white", "#fff", "#ffffff"].includes(normalizedValue)) {
    return false;
  }

  const rgbMatch = normalizedValue.match(/\d+(\.\d+)?/g);

  if (!rgbMatch || rgbMatch.length < 3) {
    return undefined;
  }

  const [red, green, blue] = rgbMatch.slice(0, 3).map(Number);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance < 128;
}

function getThemeFromBackgroundGlobals(backgrounds: unknown): string | undefined {
  if (!backgrounds || typeof backgrounds !== "object") {
    return undefined;
  }

  const value = "value" in backgrounds ? backgrounds.value : undefined;

  if (typeof value !== "string") {
    return undefined;
  }

  const isDark = isDarkColor(value);

  if (isDark === undefined) {
    return undefined;
  }

  return isDark ? DARK_THEME : DEFAULT_THEME;
}

function getThemeFromManagerDom(): string | undefined {
  if (typeof window === "undefined" || window.parent === window) {
    return undefined;
  }

  try {
    const parentDocument = window.parent.document;
    const managerRoot = parentDocument.documentElement;
    const managerBody = parentDocument.body;

    const explicitTheme =
      managerRoot.getAttribute("data-theme") ??
      managerRoot.getAttribute("data-color-mode") ??
      managerBody?.getAttribute("data-theme") ??
      managerBody?.getAttribute("data-color-mode");

    const explicitDomTheme = getThemeFromExplicitGlobals(explicitTheme);

    if (explicitDomTheme) {
      return explicitDomTheme;
    }

    const managerBackground =
      managerBody ? window.parent.getComputedStyle(managerBody).backgroundColor : "";

    const isDark = isDarkColor(managerBackground);

    if (isDark !== undefined) {
      return isDark ? DARK_THEME : DEFAULT_THEME;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function ensureManagerThemeSync(): void {
  if (
    managerObserver ||
    typeof window === "undefined" ||
    window.parent === window
  ) {
    return;
  }

  try {
    const parentDocument = window.parent.document;
    const syncTheme = () => {
      const managerTheme = getThemeFromManagerDom();

      if (managerTheme) {
        setDocumentTheme(managerTheme);
      }
    };

    managerObserver = new MutationObserver(syncTheme);
    managerObserver.observe(parentDocument.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-color-mode", "style"],
    });

    if (parentDocument.body) {
      managerObserver.observe(parentDocument.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "data-color-mode", "style"],
      });
    }

    syncTheme();
  } catch {
    managerObserver = undefined;
  }
}

export const withDarkTheme: Decorator = (Story, context) => {
  const finalTheme =
    getThemeFromExplicitGlobals(context.globals.theme) ??
    getThemeFromBackgroundGlobals(context.globals.backgrounds) ??
    getThemeFromManagerDom() ??
    DEFAULT_THEME;

  setDocumentTheme(finalTheme);
  ensureManagerThemeSync();

  return Story();
};
