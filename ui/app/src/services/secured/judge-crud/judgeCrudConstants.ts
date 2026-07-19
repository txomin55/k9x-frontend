import { getCurrentLocale } from "@/stores/i18n/i18n";

export const JUDGES_SNAPSHOT_ID = "judges";

export const CREATED_JUDGES_SNAPSHOT_ID = "judges-created";

export const getJudgesQueryKey = () => ["judges", getCurrentLocale()] as const;

export const getCreatedJudgesQueryKey = () =>
  ["judges", "created", getCurrentLocale()] as const;
