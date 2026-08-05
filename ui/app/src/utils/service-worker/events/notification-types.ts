/**
 * Metadata carried by a NEW_ENROLL push. The backend sends only ids; the frontend builds text + route.
 */
interface NewEnrollMetadata {
  competition_id: string;
  competition_name: string;
  stage_id: string;
  stage_name: string;
  event_id: string;
  event_name: string;
}

/**
 * Metadata carried by an EVENT_NOTIFICATION push: a free-text announcement an organizer sends to the
 * competitors of one or more events of a stage, plus the users subscribed to them. Its text cannot be
 * derived from the type, so it travels in `content`.
 */
interface EventNotificationMetadata {
  stage_id: string;
  stage_name: string;
  content: string;
}

/**
 * Single source of truth mapping each notification `type` to its metadata shape.
 *
 * To add a notification kind: declare its `XxxMetadata` interface above and add one entry here. The
 * `NotificationType`, the discriminated `NotificationPayload` union, the catalog and the type guard all
 * derive from this map, so the compiler forces you to handle the new kind everywhere.
 */
export interface NotificationMetadataByType {
  NEW_ENROLL: NewEnrollMetadata;
  EVENT_NOTIFICATION: EventNotificationMetadata;
}

export type NotificationType = keyof NotificationMetadataByType;
