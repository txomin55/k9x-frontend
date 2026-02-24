import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const I18nContext = createContext();

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    backend: {
      ns: ["translation"],
      loadPath: `${process.env.VITE_APP_BASE_PATH}/locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState();
  const [ready, setReady] = useState(false);

  i18n.on("initialized", () => {
    setLocale(i18n.language);
    setReady(true);
  });

  useEffect(() => {
    if (ready) {
      i18n.changeLanguage(locale);
    }
  }, [ready, locale]);

  return (
    <I18nContext.Provider
      value={{ t: i18n.t, setLocale, locale, locales: ["en", "es"] }}
    >
      {ready ? children : "Loading translations..."}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  return useContext(I18nContext);
};
