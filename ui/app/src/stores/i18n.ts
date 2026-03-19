import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { createAppStore } from "@/utils/store/createAppStore";

enum TranslationLocale {
  EN = "en",
  ES = "es",
}

const locales = Object.values(TranslationLocale);
type Locale = TranslationLocale;

type I18nState = {
  locale: Locale;
  ready: boolean;
};

const {
  setState,
  store: i18nStore,
  useAppStore,
} = createAppStore<I18nState>({
  locale: TranslationLocale.EN,
  ready: false,
});

let initPromise: Promise<void> | undefined;

const setI18nState = (updater: (state: I18nState) => I18nState) => {
  setState(updater);
};

const normalizeLocale = (inputLocale: unknown): Locale => {
  if (!inputLocale) return TranslationLocale.EN;

  const canonicalLocale = String(inputLocale).trim().toLowerCase();

  if (locales.includes(canonicalLocale as Locale)) {
    return canonicalLocale as Locale;
  }

  const [baseLocale] = canonicalLocale.split("-");

  if (baseLocale && locales.includes(baseLocale as Locale)) {
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
      supportedLngs: locales,
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
      setI18nState(() => ({
        locale: normalizeLocale(i18n.language),
        ready: true,
      }));
    });

  return initPromise;
};

const setLocale = async (nextLocale: string) => {
  await initI18n();
  await i18n.changeLanguage(normalizeLocale(nextLocale));
  setI18nState((state) => ({
    ...state,
    locale: normalizeLocale(i18n.language),
  }));
};

const t = (key: string, options?: Record<string, unknown>) => {
  if (!i18n.isInitialized) return key;
  return i18n.t(key, options);
};

const useI18n = <TSelected>(selector: (state: I18nState) => TSelected) =>
  useAppStore(selector);

const useLocale = () => useI18n((state) => state.locale);
const useI18nReady = () => useI18n((state) => state.ready);

export {
  i18nStore,
  initI18n,
  locales,
  setLocale,
  t,
  TranslationLocale,
  useI18nReady,
  useLocale,
};
