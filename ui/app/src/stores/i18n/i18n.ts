import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { createAppStore } from "@/utils/store/createAppStore";
import { saveActiveNotificationTranslations } from "@/utils/local-first/notification_translations/notificationTranslationsStore";
import type { I18nState, Locale } from "@/stores/i18n/i18n.types";

const NOTIFICATION_KEY_PREFIX = "NOTIFICATION.";

const LOCALE_STORAGE_KEY = "k9x_locale";

const DETECTION_OPTIONS = {
  order: ["localStorage", "navigator", "htmlTag"],
  caches: ["localStorage"],
  lookupLocalStorage: LOCALE_STORAGE_KEY,
};

const readStoredLocale = () => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) return;

  try {
    return globalThis.localStorage.getItem(LOCALE_STORAGE_KEY) ?? undefined;
  } catch {
    // ignore: locale persistence must never break the app
  }
};

const persistLocale = (locale: string) => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) return;

  try {
    globalThis.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore: locale persistence must never break the app
  }
};

/**
 * Persists just the notification strings of the currently active language so the service worker can
 * render push notifications with the app closed. Overwrites whatever was stored, so the dictionary can
 * never go stale behind a deploy. Best-effort: never blocks or breaks i18n init.
 *
 * Awaits the i18next bundle rather than `initPromise` — the init `.then()` calls this, and awaiting the
 * promise it is itself resolving would deadlock and silently skip the write.
 *
 * Never stores an empty dictionary: callers such as the token refresh can run before i18next has any
 * resources loaded, and overwriting a good record with `{}` is what makes a push render raw keys.
 */
const persistNotificationTranslations = async () => {
  if (!bundleReadyPromise) return;

  try {
    await bundleReadyPromise;

    const bundle =
      (i18n.getResourceBundle(i18n.language, "translation") as
        | Record<string, string>
        | undefined) ?? {};
    const translations = Object.fromEntries(
      Object.entries(bundle).filter(([key]) =>
        key.startsWith(NOTIFICATION_KEY_PREFIX),
      ),
    );

    if (!Object.keys(translations).length) return;

    await saveActiveNotificationTranslations(
      normalizeLocale(i18n.language),
      translations,
    );
  } catch {
    // ignore: notification i18n persistence must never affect the app
  }
};

enum TranslationLocale {
  EN = "en",
  ES = "es",
  PT = "pt",
}

const locales = Object.values(TranslationLocale);
const supportedLocales = locales as Locale[];

const { getState, setState, useAppStore } = createAppStore<I18nState>({
  locale: TranslationLocale.EN,
  ready: false,
  translationsLoaded: false,
});

const hasBundle = (language: string) =>
  Object.keys(
    (i18n.getResourceBundle(language, "translation") as
      | Record<string, string>
      | undefined) ?? {},
  ).length > 0;

const hasActiveBundle = () =>
  hasBundle(i18n.language) || hasBundle(TranslationLocale.EN);

const syncTranslationsLoaded = () => {
  setState((state) => ({
    ...state,
    translationsLoaded: hasActiveBundle(),
  }));
};

let initPromise: Promise<void> | undefined;
let bundleReadyPromise: Promise<unknown> | undefined;

export const normalizeLocale = (inputLocale: unknown): Locale => {
  const candidates = (Array.isArray(inputLocale) ? inputLocale : [inputLocale])
    .filter(Boolean)
    .map((locale) => String(locale).trim().toLowerCase());

  for (const candidate of candidates) {
    if (supportedLocales.includes(candidate as Locale)) {
      return candidate as Locale;
    }

    const [baseLocale] = candidate.split("-");

    if (baseLocale && supportedLocales.includes(baseLocale as Locale)) {
      return baseLocale as Locale;
    }
  }

  return TranslationLocale.EN;
};

const initI18n = async () => {
  if (initPromise || typeof globalThis === "undefined") return initPromise;

  const languageDetector = new LanguageDetector();
  languageDetector.init(undefined, DETECTION_OPTIONS);

  i18n.on("loaded", syncTranslationsLoaded);

  bundleReadyPromise = i18n
    .use(Backend)
    .use(languageDetector)
    .init({
      fallbackLng: TranslationLocale.EN,
      debug: true,
      supportedLngs: supportedLocales,
      load: "currentOnly",
      backend: {
        ns: ["translation"],
        loadPath: `${import.meta.env.VITE_APP_BASE_PATH ?? ""}/locales/{{lng}}/{{ns}}.json`,
      },
      interpolation: {
        escapeValue: false,
      },
      keySeparator: false,
      nsSeparator: false,
      detection: DETECTION_OPTIONS,
      lng: normalizeLocale(readStoredLocale() ?? languageDetector.detect()),
    });

  initPromise = bundleReadyPromise.then(() => {
    setState(() => ({
      locale: normalizeLocale(i18n.language),
      ready: true,
      translationsLoaded: hasActiveBundle(),
    }));
    void persistNotificationTranslations();
  });

  return initPromise;
};

const getCurrentLocale = () => getState().locale;

const translate = (key: string, options?: Record<string, unknown>) => {
  if (!getState().ready) return key;
  return i18n.t(key, options);
};

const useI18n = () => {
  const locale = useAppStore((state) => state.locale);
  const ready = useAppStore((state) => state.ready);
  const translationsLoaded = useAppStore((state) => state.translationsLoaded);
  return {
    init: initI18n,
    locale,
    ready,
    translationsLoaded,
    locales: supportedLocales,
    setLocale: async (nextLocale: string) => {
      if (!ready()) return;
      await i18n.changeLanguage(normalizeLocale(nextLocale));
      const activeLocale = normalizeLocale(i18n.language);
      persistLocale(activeLocale);
      setState((state) => ({
        ...state,
        locale: activeLocale,
      }));
      await persistNotificationTranslations();
    },
    t: (key: string, options?: Record<string, unknown>) => {
      if (!locale() || !ready() || !translationsLoaded()) return "";
      return i18n.t(key, options);
    },
  };
};

export {
  getCurrentLocale,
  initI18n,
  persistNotificationTranslations,
  translate,
  useI18n,
};
