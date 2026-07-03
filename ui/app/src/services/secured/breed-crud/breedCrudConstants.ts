import { getCurrentLocale } from "@/stores/i18n/i18n";

export const BREEDS_SNAPSHOT_ID = "breeds";

export const getBreedsQueryKey = () => ["breeds", getCurrentLocale()] as const;
