import React, { createContext, useContext, useMemo, useState } from "react";
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
      loadPath: `${import.meta.env.VITE_APP_BASE_PATH}/locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(i18n.language);

  const api = useMemo(
    () => ({
      t: i18n.t,
      setLocale: async (l) => {
        await i18n.changeLanguage(l);
        setLocale(l);
      },
      locale,
      locales: ["en", "es"],
    }),
    [locale],
  );

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  return useContext(I18nContext);
};
