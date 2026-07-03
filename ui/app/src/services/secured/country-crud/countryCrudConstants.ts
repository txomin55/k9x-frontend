import { getCurrentLocale } from "@/stores/i18n/i18n";

export const COUNTRIES_SNAPSHOT_ID = "countries";

export const getCountriesQueryKey = () =>
  ["countries", getCurrentLocale()] as const;
