import {
  isNotificationType,
  renderNotification,
} from "@/utils/service-worker/events/notification-catalog";
import type {
  NotificationMetadataByType,
  NotificationType,
} from "@/utils/service-worker/events/notification-types";
import { readActiveNotificationTranslations } from "@/utils/local-first/notification_translations/notificationTranslationsStore";
import { resolveAppPath } from "@/utils/paths/app-paths";

interface RawPushEnvelope {
  type?: string;
  metadata?: Record<string, string>;
}

const parseEnvelope = (event): RawPushEnvelope => {
  if (!event.data) return {};
  try {
    return event.data.json() as RawPushEnvelope;
  } catch {
    return {};
  }
};

export const registerPushHandler = (scope) => {
  // App icon, resolved through the same base-path helper the manifest and SW registration use.
  const iconUrl = resolveAppPath("/k9x-512.png");

  scope.addEventListener("push", (event) => {
    const { type, metadata } = parseEnvelope(event);
    if (!type || !isNotificationType(type)) return;

    // Network payload: `type` is validated by the guard; its metadata is trusted to match the contract.
    const typedMetadata = (metadata ??
      {}) as unknown as NotificationMetadataByType[NotificationType];

    event.waitUntil(
      (async () => {
        // The app persists the active language's notification strings on every load, so by the time a
        // push can arrive (which requires having opened the app to subscribe) this record exists.
        const record = await readActiveNotificationTranslations();
        const { title, body, url } = renderNotification(
          type,
          typedMetadata,
          record?.translations ?? {},
        );

        await scope.registration.showNotification(title, {
          body,
          icon: iconUrl,
          badge: iconUrl,
          // `notification-click.ts` reads `data.url` to open/focus the app on click.
          data: { url },
        });
      })(),
    );
  });
};
