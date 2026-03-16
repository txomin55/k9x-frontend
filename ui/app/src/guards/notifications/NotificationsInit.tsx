import { createEffect } from "solid-js";
import { auth } from "@/stores/auth";
import { initNotifications } from "@/utils/notifications/notifications";

export default function NotificationGuard(props) {
  createEffect(async () => {
    if (auth().user) {
      await initNotifications();
    }
  });

  return <>{props.children}</>;
}
