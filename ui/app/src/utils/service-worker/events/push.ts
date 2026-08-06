import {
  isNotificationType,
  renderNotification,
} from "@/utils/service-worker/events/notification-catalog";
import type {
  NotificationMetadataByType,
  NotificationType,
} from "@/utils/service-worker/events/notification-types";
import { readActiveNotificationTranslations } from "@/utils/local-first/notification_translations/notificationTranslationsStore";
import { stripRichTextMarkers } from "@/utils/rich-text/richText";
import { resolveAppPath } from "@/utils/paths/app-paths";

interface RawPushEnvelope {
  type?: string;
  metadata?: Record<string, string>;
}

// Prefix to grep for in the service worker console (DevTools > Application > Service Workers > inspect).
const LOG_PREFIX = "[k9x-push]";

const parseEnvelope = (event): RawPushEnvelope => {
  if (!event.data) return {};
  try {
    return event.data.json() as RawPushEnvelope;
  } catch {
    console.warn(`${LOG_PREFIX} payload is not JSON:`, event.data.text?.());
    return {};
  }
};

export const registerPushHandler = (scope) => {
  // App icon, resolved through the same base-path helper the manifest and SW registration use.
  const iconUrl = resolveAppPath("/k9x-512.png");

  scope.addEventListener("push", (event) => {
    const { type, metadata } = parseEnvelope(event);

    // A push whose type this build does not know about is dropped. Logged rather than swallowed: it means
    // the backend sends a kind the service worker bundle predates, and the symptom is a push that simply
    // never appears.
    if (!type || !isNotificationType(type)) {
      console.warn(`${LOG_PREFIX} dropped: unknown notification type`, type);
      return;
    }

    console.info(`${LOG_PREFIX} received ${type}`, metadata);

    // Network payload: `type` is validated by the guard; its metadata is trusted to match the contract.
    const typedMetadata = (metadata ??
      {}) as unknown as NotificationMetadataByType[NotificationType];

    event.waitUntil(
      (async () => {
        try {
          // The app persists the active language's notification strings on every load, so by the time a
          // push can arrive (which requires having opened the app to subscribe) this record exists.
          const record = await readActiveNotificationTranslations();
          const { title, body, url } = renderNotification(
            type,
            typedMetadata,
            record?.translations ?? {},
          );

          await scope.registration.showNotification(title, {
            // A Web Push body is plain text, so an organizer's *bold* would reach the tray with the
            // asterisks in it. The in-app list renders the markers instead of dropping them.
            body: stripRichTextMarkers(body),
            icon: iconUrl,
            badge: iconUrl,
            // `notification-click.ts` reads `data.url` to open/focus the app on click.
            data: { url },
          });
          console.info(`${LOG_PREFIX} shown ${type}`);
        } catch (error) {
          // Without this the rejection is invisible: the browser only sees a failed waitUntil.
          console.error(`${LOG_PREFIX} failed to show ${type}`, error);
        }
      })(),
    );
  });
};
