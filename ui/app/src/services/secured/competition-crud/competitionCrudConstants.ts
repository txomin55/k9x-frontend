import { getCurrentLocale } from "@/stores/i18n/i18n";

export const COMPETITIONS_SNAPSHOT_ID = "competitions";

export const getCompetitionsQueryKey = () =>
  ["competitions", getCurrentLocale()] as const;

export const getCompetitionsByCountryQueryKey = (country: string) =>
  ["competitions", "country", country, getCurrentLocale()] as const;

export const SELECTABLE_COMPETITIONS_SNAPSHOT_ID = "competitions-selectable";

export const getSelectableCompetitionsQueryKey = () =>
  ["competitions", "selectable", getCurrentLocale()] as const;
