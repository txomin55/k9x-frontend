import { createSignal } from "solid-js";
import {
  removeNotificationSetup,
  setNotificationSetup,
  toPushSubscriptionRequest,
} from "@/services/secured/notification-setup/notificationSetup";
import {
  enablePushNotifications,
  getPushNotificationsState,
  isPushNotificationSupported,
  unsubscribeFromPushNotifications,
} from "@/utils/notifications/notifications";
import { translate } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

const PUSH_PREFERENCE_KEY = "k9x_push_notifications_enabled";

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
 * The browser never lets us revoke a granted permission from script, so an
 * explicit opt-out is persisted locally to keep the auto-subscribe effect from
 * re-enabling push behind the user's back.
 */
const isPushOptedOut = () =>
  globalThis.localStorage?.getItem(PUSH_PREFERENCE_KEY) === "false";

const persistPushPreference = (enabled: boolean) =>
  globalThis.localStorage?.setItem(PUSH_PREFERENCE_KEY, String(enabled));

const syncPushNotificationsState = async () => {
  const { permission, subscription } = await getPushNotificationsState();

  const enabled =
    permission === "granted" && Boolean(subscription) && !isPushOptedOut();

  setPushNotificationsEnabled(enabled);

  return enabled;
};

const enablePushNotificationsSetup = async () => {
  if (!VAPID_PUBLIC_KEY) return false;

  const { subscription } = await enablePushNotifications(
    urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  );

  if (!subscription) {
    setPushNotificationsEnabled(false);
    return false;
  }

  const payload = toPushSubscriptionRequest(subscription);
  if (!payload) {
    setPushNotificationsEnabled(false);
    return false;
  }

  await setNotificationSetup(payload);

  persistPushPreference(true);
  setPushNotificationsEnabled(true);

  return true;
};

/**
 * Dropping the browser subscription is local and always succeeds, so the checkbox stays off even if the
 * server never hears about it: the row is pruned anyway the next time a push to that endpoint comes back
 * 410 Gone. When offline the removal is queued and replayed on reconnect.
 */
const disablePushNotificationsSetup = async () => {
  const endpoint = await unsubscribeFromPushNotifications();

  persistPushPreference(false);
  setPushNotificationsEnabled(false);

  if (!endpoint) return;

  await removeNotificationSetup({ endpoint });
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
      persistPushPreference(previouslyEnabled);
      setPushNotificationsEnabled(previouslyEnabled);
      showToast(translate("GLOBAL.NAVIGATION.NOTIFICATIONS_UNAVAILABLE"));
    }
  } finally {
    setPushNotificationsBusy(false);
  }
};

export {
  enablePushNotificationsSetup,
  isPushNotificationSupported,
  isPushOptedOut,
  pushNotificationsBusy,
  pushNotificationsEnabled,
  syncPushNotificationsState,
  togglePushNotifications,
};
