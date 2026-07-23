import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { createAppStore } from "@/utils/store/createAppStore";
import { saveActiveNotificationTranslations } from "@/utils/local-first/notification_translations/notificationTranslationsStore";
import type { I18nState, Locale } from "@/stores/i18n/i18n.types";

const NOTIFICATION_KEY_PREFIX = "NOTIFICATION.";

/**
 * Persists just the notification strings of the currently active language so the service worker can
 * render push notifications with the app closed. Best-effort: never blocks or breaks i18n init.
 */
const persistNotificationTranslations = () => {
  try {
    const bundle =
      (i18n.getResourceBundle(i18n.language, "translation") as
        | Record<string, string>
        | undefined) ?? {};
    const translations = Object.fromEntries(
      Object.entries(bundle).filter(([key]) =>
        key.startsWith(NOTIFICATION_KEY_PREFIX),
      ),
    );
    void saveActiveNotificationTranslations(
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
}

const locales = Object.values(TranslationLocale);
const supportedLocales = locales as Locale[];

const { getState, setState, useAppStore } = createAppStore<I18nState>({
  locale: TranslationLocale.EN,
  ready: false,
});

let initPromise: Promise<void> | undefined;

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
  languageDetector.init();

  initPromise = i18n
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
      lng: normalizeLocale(languageDetector.detect()),
    })
    .then(() => {
      setState(() => ({
        locale: normalizeLocale(i18n.language),
        ready: true,
      }));
      persistNotificationTranslations();
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
  return {
    init: initI18n,
    locale,
    ready,
    locales: supportedLocales,
    setLocale: async (nextLocale: string) => {
      if (!ready()) return;
      await i18n.changeLanguage(normalizeLocale(nextLocale));
      setState((state) => ({
        ...state,
        locale: normalizeLocale(i18n.language),
      }));
      persistNotificationTranslations();
    },
    t: (key: string, options?: Record<string, unknown>) => {
      if (!locale() || !ready()) return key;
      return i18n.t(key, options);
    },
  };
};

export { getCurrentLocale, initI18n, translate, useI18n };
