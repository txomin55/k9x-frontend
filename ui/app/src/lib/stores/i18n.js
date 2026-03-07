import { derived, writable } from "svelte/store";
import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const locales = ["en", "es"];
const locale = writable("en");
const ready = writable(false);

let initPromise;

const initI18n = async () => {
  if (initPromise || typeof globalThis === "undefined") return initPromise;

  initPromise = i18n
    .use(Backend)
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      debug: true,
      backend: {
        ns: ["translation"],
        loadPath: `${import.meta.env.VITE_APP_BASE_PATH ?? ""}/locales/{{lng}}/{{ns}}.json`,
      },
      interpolation: {
        escapeValue: false,
      },
    })
    .then(() => {
      locale.set(i18n.language);
      ready.set(true);
    });

  return initPromise;
};

const setLocale = async (nextLocale) => {
  await initI18n();
  await i18n.changeLanguage(nextLocale);
  locale.set(i18n.language);
};

const t = derived(locale, () => (key, options) => {
  if (!i18n.isInitialized) return key;
  return i18n.t(key, options);
});

export { i18n, initI18n, locale, locales, ready, setLocale, t };
