import { createEffect } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import {
  registerPushSubscriptionSetup,
  syncPushNotificationsState,
} from "@/stores/push-notifications/pushNotifications";

export default function NotificationGuard(props) {
  const user = useAuthUser();

  createEffect(async () => {
    if (!user()) return;

    syncPushNotificationsState();

    // Registrar es mantenimiento, no un gesto del usuario: mantiene este dispositivo como destino
    // (el endpoint puede haber rotado) sin tocar la preferencia de la cuenta, que solo escribe el
    // checkbox. Asi una cuenta silenciada no se reactiva sola al abrir la app en otro dispositivo.
    await registerPushSubscriptionSetup();
  });

  return <>{props.children}</>;
}
