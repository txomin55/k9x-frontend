import { createEffect } from "solid-js";
import { useAuthUser } from "@/stores/auth";
import { enablePushNotifications, requestNotificationPermission } from "@/utils/notifications/notifications";

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
    if (user()) {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        const result = await enablePushNotifications(
          urlBase64ToUint8Array(
            "BNIMHEea0OJUDPaknHTjF2zaN4fMRh-rmtBc5FPlDy7OqHChTEK2SM_Ru1PM4rjtMCdEmaNUPd8Nr94mEkXD9b0",
          ),
        );
        /* TODO
        ogwPEP4WkygHksYC1tSqcPrxxNuXEIFHgbydYVBfU9E

{
    "endpoint": "https://fcm.googleapis.com/fcm/send/d-i58pgN0_8:APA91bG21-CnGP5n9Mo6DHt_rF3tEW48AuYwSrarn8mQaLIueH88rYXNPK8Mwh5MJ2i0wpP98luggMFtWcYz5ozxIOs4KGhAeTnIgSIaC7PgiAG3BDbWzxynqpcr_Ql3Nw6yHIub6pJg",
    "expirationTime": null,
    "keys": {
        "p256dh": "BKH9jDu1p0AUuXp5oOQ1lRX2VAQ8kevxtrW8p9V9Bn3Riyx4Xb9oytXcTfw9pg88upXRBC2cPS6sB-0ohnoUaMM",
        "auth": "Y44iDxmoWH7_REoMkUu9gw"
    }
}

if (!result.subscription) return;

await fetch("/api/push/subscriptions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(result.subscription),
});
 */
      }
    }
  });

  return <>{props.children}</>;
}
