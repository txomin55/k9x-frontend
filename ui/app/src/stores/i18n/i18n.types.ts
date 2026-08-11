export type Locale = "en" | "es" | "pt";

export type I18nState = {
  locale: Locale;
  ready: boolean;
  translationsLoaded: boolean;
};
