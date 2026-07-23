import {
  LOCAL_FIRST_STORE_NAMES,
  getLocalFirstTable,
} from "@/utils/local-first/storage/localFirstDatabase";

/**
 * The single record holding the translations for the language the app currently has active. Written by
 * the app whenever i18next is ready or the user switches language, and read by the service worker to
 * render push notifications while the app is closed (the SW cannot reach the i18next runtime).
 *
 * Only ever ONE record (`id: "active"`): switching language overwrites it, so we never accumulate
 * translation files for every language.
 */
export interface NotificationTranslations {
  id: string;
  locale: string;
  translations: Record<string, string>;
}

const ACTIVE_ID = "active";

const getTable = () =>
  getLocalFirstTable<NotificationTranslations, string>(
    LOCAL_FIRST_STORE_NAMES.notificationTranslations,
  );

export const saveActiveNotificationTranslations = async (
  locale: string,
  translations: Record<string, string>,
): Promise<void> => {
  const table = await getTable();
  await table.put({ id: ACTIVE_ID, locale, translations });
};

export const readActiveNotificationTranslations =
  async (): Promise<NotificationTranslations | undefined> => {
    const table = await getTable();
    return table.get(ACTIVE_ID);
  };
