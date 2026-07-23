import type {
  NotificationMetadataByType,
  NotificationType,
} from "@/utils/service-worker/events/notification-types";

export interface RenderedNotification {
  title: string;
  body: string;
  url?: string;
}

/**
 * Looks up a translation key in the active-language dictionary and interpolates `{{ placeholders }}`
 * with the given values — the service worker's stand-in for i18next, which it cannot run.
 */
type Translate = (key: string, values?: Record<string, string>) => string;

/**
 * One renderer per notification type, each receiving its own strongly-typed metadata and a `t` helper.
 * The renderer builds its title/body explicitly, choosing exactly which key and which metadata to
 * interpolate, and the route to open on click. Adding a type to `NotificationMetadataByType` makes this
 * object fail to compile until its renderer is added.
 */
type NotificationCatalog = {
  [Type in NotificationType]: (
    metadata: NotificationMetadataByType[Type],
    t: Translate,
  ) => RenderedNotification;
};

const catalog: NotificationCatalog = {
  NEW_ENROLL: (metadata, t) => ({
    title: t("NOTIFICATION.NEW_ENROLL.TITLE", {
      event_name: metadata.event_name,
    }),
    body: t("NOTIFICATION.NEW_ENROLL.BODY", {
      competition_name: metadata.competition_name,
      stage_name: metadata.stage_name,
    }),
    url: `/my/competitions/${metadata.competition_id}/stages/${metadata.stage_id}/events/${metadata.event_id}?unverified=true`,
  }),
};

export const isNotificationType = (type: string): type is NotificationType =>
  type in catalog;

const interpolate = (template: string, values: Record<string, string>) =>
  template.replace(/\{\{\s*(\w+)\s*}}/g, (_, key) => values[key] ?? "");

/**
 * Produces the final, ready-to-show notification for a push: builds a `t` bound to the active-language
 * dictionary and hands it to the type's renderer.
 */
export const renderNotification = <Type extends NotificationType>(
  type: Type,
  metadata: NotificationMetadataByType[Type],
  translations: Record<string, string>,
): RenderedNotification => {
  const t: Translate = (key, values = {}) =>
    interpolate(translations[key] ?? key, values);
  const render = catalog[type] as (
    metadata: NotificationMetadataByType[Type],
    t: Translate,
  ) => RenderedNotification;
  return render(metadata, t);
};
