import type {
  NotificationMetadataByType,
  NotificationType,
} from "@/utils/service-worker/events/notification-types";

/**
 * A stored notification returned by GET /secured/notifications. Discriminated by `type` and carrying the
 * exact same strongly-typed metadata as the push path (`NotificationMetadataByType`), plus a timestamp
 * and the seen flag — so the in-app list renders identical title/body via the shared catalog.
 */
export type NotificationResponseDTO = {
  [Type in NotificationType]: {
    id: string;
    timestamp: number;
    type: Type;
    metadata: NotificationMetadataByType[Type];
    seen: boolean;
  };
}[NotificationType];

export interface MarkNotificationsSeenRequestDTO {
  markSeen: string[];
}
