import { createSignal } from "solid-js";
import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import axios from "@/utils/axios";

const locales = ["en", "es"];
const [locale, setLocaleValue] = createSignal("en");
const [ready, setReady] = createSignal(false);

let initPromise;

const normalizeLocale = (inputLocale) => {
  if (!inputLocale) return "en";

  const canonicalLocale = String(inputLocale).trim().toLowerCase();

  if (locales.includes(canonicalLocale)) {
    return canonicalLocale;
  }

  const [baseLocale] = canonicalLocale.split("-");

  if (baseLocale && locales.includes(baseLocale)) {
    return baseLocale;
  }

  return "en";
};

const initI18n = async () => {
  if (initPromise || typeof globalThis === "undefined") return initPromise;

  const languageDetector = new LanguageDetector();
  languageDetector.init();

  initPromise = i18n
    .use(Backend)
    .use(languageDetector)
    .init({
      fallbackLng: "en",
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
      setLocaleValue(i18n.language);
      axios.setLocale(i18n.language);
      setReady(true);
    });

  return initPromise;
};

const setLocale = async (nextLocale) => {
  await initI18n();
  await i18n.changeLanguage(normalizeLocale(nextLocale));
  setLocaleValue(i18n.language);
  axios.setLocale(i18n.language);
};

const t = (key, options) => {
  locale();
  if (!i18n.isInitialized) return key;
  return i18n.t(key, options);
};

export { i18n, initI18n, locale, locales, ready, setLocale, t };
