import { createEffect } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import {
  setNotificationSetup,
  toPushSubscriptionRequest,
} from "@/services/secured/notification-setup/notificationSetup";
import {
  enablePushNotifications,
  requestNotificationPermission,
} from "@/utils/notifications/notifications";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function NotificationGuard(props) {
  const user = useAuthUser();

  createEffect(async () => {
    if (!user() || !VAPID_PUBLIC_KEY) return;

    const permission = await requestNotificationPermission();
    if (permission !== "granted") return;

    const { subscription } = await enablePushNotifications(
      urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    );
    if (!subscription) return;

    const payload = toPushSubscriptionRequest(subscription);
    if (!payload) return;

    await setNotificationSetup(payload);
  });

  return <>{props.children}</>;
}
