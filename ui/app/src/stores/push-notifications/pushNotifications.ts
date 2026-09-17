import { createSignal } from "solid-js";
import {
  setNotificationSetup,
  setNotificationsEnabled,
  toPushSubscriptionRequest,
} from "@/services/secured/notification-setup/notificationSetup";
import {
  enablePushNotifications,
  getPushNotificationsState,
  isPushNotificationSupported,
} from "@/utils/notifications/notifications";
import { getAuthUser } from "@/stores/auth/auth";
import { translate } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

const [pushNotificationsEnabled, setPushNotificationsEnabled] =
  createSignal(false);
const [pushNotificationsBusy, setPushNotificationsBusy] = createSignal(false);

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

/**
 * The checkbox shows the account's setting, which the user may have flipped from another device, so it
 * comes from the profile rather than from what this browser happens to have subscribed. A device with
 * no permission still renders the account state — it just is not one of the devices being reached.
 */
const syncPushNotificationsState = () => {
  const enabled = Boolean(getAuthUser()?.notificationsEnabled);

  setPushNotificationsEnabled(enabled);

  return enabled;
};

/**
 * Makes this device a delivery target, without claiming the user wants notifications: that is the
 * account setting, and only the checkbox writes it. Safe to call on every start, and a no-op when the
 * browser has not granted permission, since there is no subscription to register without it.
 */
const registerPushSubscriptionSetup = async () => {
  if (!VAPID_PUBLIC_KEY) return false;

  const { subscription } = await enablePushNotifications(
    urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  );

  if (!subscription) return false;

  const payload = toPushSubscriptionRequest(subscription);
  if (!payload) return false;

  await setNotificationSetup(payload);

  return true;
};

/**
 * Turning notifications off never drops the browser subscription: its keys cannot be recreated from the
 * server, so a device that forgets them could not be reached again by turning notifications back on
 * from somewhere else — which is the whole point of the setting being account-wide. The server simply
 * stops resolving this account's devices as targets.
 */
const disablePushNotificationsSetup = () =>
  setNotificationsEnabled({ enabled: false });

/**
 * Enabling both registers this device and turns the account on. Registering first means the device the
 * user is looking at is already a target by the time the setting flips.
 */
const enablePushNotificationsSetup = async () => {
  const registered = await registerPushSubscriptionSetup();

  if (!registered) return false;

  await setNotificationsEnabled({ enabled: true });

  return true;
};

/**
 * The checkbox reflects the user's intent immediately and the work happens behind it. Only enabling can
 * be rejected — a denied permission prompt, or a first-time subscribe with no connection to the push
 * service — and that is the one case that flips the checkbox back.
 */
const togglePushNotifications = async (enabled: boolean) => {
  if (pushNotificationsBusy()) return;

  const previouslyEnabled = pushNotificationsEnabled();

  setPushNotificationsBusy(true);
  setPushNotificationsEnabled(enabled);

  try {
    if (!enabled) {
      await disablePushNotificationsSetup();
      return;
    }

    const granted = await enablePushNotificationsSetup().catch(() => false);

    if (!granted) {
      setPushNotificationsEnabled(previouslyEnabled);
      showToast(translate("GLOBAL.NAVIGATION.NOTIFICATIONS_UNAVAILABLE"));
    }
  } finally {
    setPushNotificationsBusy(false);
  }
};

export {
  getPushNotificationsState,
  isPushNotificationSupported,
  pushNotificationsBusy,
  pushNotificationsEnabled,
  registerPushSubscriptionSetup,
  syncPushNotificationsState,
  togglePushNotifications,
};
