import { createEffect } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import {
  enablePushNotificationsSetup,
  isPushOptedOut,
  syncPushNotificationsState,
} from "@/stores/push-notifications/pushNotifications";

export default function NotificationGuard(props) {
  const user = useAuthUser();

  createEffect(async () => {
    if (!user()) return;

    if (isPushOptedOut()) {
      await syncPushNotificationsState();
      return;
    }

    const enabled = await enablePushNotificationsSetup();
    if (!enabled) await syncPushNotificationsState();
  });

  return <>{props.children}</>;
}
