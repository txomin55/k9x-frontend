import { getCurrentLocale } from "@/stores/i18n";

export const JUDGES_SNAPSHOT_ID = "judges";

export const getJudgesQueryKey = () =>
  ["judges", getCurrentLocale()] as const;
