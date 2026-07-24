import { getCurrentLocale } from "@/stores/i18n/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory";
import type {
  MarkNotificationsSeenRequestDTO,
  NotificationResponseDTO,
} from "@/services/secured/notifications/notifications.types";

export type { NotificationResponseDTO } from "@/services/secured/notifications/notifications.types";

const NOTIFICATIONS_ENDPOINT_PATH = "/secured/notifications";

export const getNotificationsQueryKey = () =>
  ["notifications", getCurrentLocale()] as const;

const fetchNotifications = () =>
  rawRequest<NotificationResponseDTO[]>({
    auth: true,
    path: NOTIFICATIONS_ENDPOINT_PATH,
  });

const notificationsQuery = defineQuery({
  fetcher: fetchNotifications,
  queryKey: ["notifications"] as const,
});

export const useNotifications = (override?: TanstackCreateQuery) =>
  notificationsQuery.useQuery({
    networkMode: "always",
    ...override,
  });

const putNotificationsSeen = (ids: string[]) =>
  rawRequest<void>({
    auth: true,
    body: { markSeen: ids } satisfies MarkNotificationsSeenRequestDTO,
    method: "PUT",
    path: `${NOTIFICATIONS_ENDPOINT_PATH}/seen`,
  });

export const markNotificationsAsSeen = async (ids: string[]) => {
  if (!ids.length) return;

  const queryKey = getNotificationsQueryKey();
  const previous =
    queryClient.getQueryData<NotificationResponseDTO[]>(queryKey);

  queryClient.setQueryData<NotificationResponseDTO[]>(queryKey, (current) =>
    current?.map((notification) =>
      ids.includes(notification.id)
        ? { ...notification, seen: true }
        : notification,
    ),
  );

  try {
    await putNotificationsSeen(ids);
  } catch (error) {
    queryClient.setQueryData(queryKey, previous);
    throw error;
  }
};
