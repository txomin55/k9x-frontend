import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { createAppStore } from "@/utils/store/createAppStore";
import type { I18nState, Locale } from "@/stores/i18n.types";

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

const normalizeLocale = (inputLocale: unknown): Locale => {
  if (!inputLocale) return TranslationLocale.EN;

  const canonicalLocale = String(inputLocale).trim().toLowerCase();

  if (supportedLocales.includes(canonicalLocale as Locale)) {
    return canonicalLocale as Locale;
  }

  const [baseLocale] = canonicalLocale.split("-");

  if (baseLocale && supportedLocales.includes(baseLocale as Locale)) {
    return baseLocale as Locale;
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
      lng: normalizeLocale(languageDetector.detect()),
    })
    .then(() => {
      setState(() => ({
        locale: normalizeLocale(i18n.language),
        ready: true,
      }));
    });

  return initPromise;
};

const getCurrentLocale = () => getState().locale;

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
    },
    t: (key: string, options?: Record<string, unknown>) => {
      if (!locale() || !ready()) return key;
      return i18n.t(key, options);
    },
  };
};

export { getCurrentLocale, initI18n, useI18n };
