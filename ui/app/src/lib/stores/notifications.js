import { writable } from "svelte/store";
import { resolve } from "$app/paths";
import {
  initializePushNotifications,
  isPushNotificationSupported,
  sendNotification,
} from "$lib/utils/native_features/notifications/push-notifications.js";
import mockedNotification from "$lib/components/reload_prompt/mockedNotification.js";

const needRefresh = writable(false);
const offlineReady = writable(false);
const notificationPermission = writable("default");

let registrationRef = null;
let registrationReady = null;
let initialized = false;

const shouldPromptRefresh = (registration) => {
  if (!registration?.waiting) return false;
  if (!navigator.serviceWorker?.controller) return false;
  const waitingUrl = registration.waiting.scriptURL;
  const activeUrl =
    registration.active?.scriptURL ||
    navigator.serviceWorker.controller.scriptURL;
  return !(waitingUrl && activeUrl && waitingUrl === activeUrl);
};

const initNotifications = async () => {
  if (initialized) return;
  initialized = true;

  if (!("serviceWorker" in navigator)) return;

  const swPath = import.meta.env.DEV ? "/sw-dev.js" : "/service-worker.js";
  const swUrl = new URL(resolve(swPath), globalThis.location.origin);
  const scope = resolve("/");

  try {
    const swRegistration = await navigator.serviceWorker.register(swUrl, {
      scope,
      type: "module",
    });

    registrationRef = swRegistration;

    if (shouldPromptRefresh(swRegistration)) {
      needRefresh.set(true);
    }

    swRegistration.addEventListener("updatefound", () => {
      const installing = swRegistration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state !== "installed") return;
        if (!navigator.serviceWorker.controller) {
          offlineReady.set(true);
          return;
        }
        if (shouldPromptRefresh(swRegistration)) {
          needRefresh.set(true);
        }
      });
    });
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }

  registrationReady = navigator.serviceWorker.ready
    .then((readyRegistration) => {
      if (shouldPromptRefresh(readyRegistration)) {
        needRefresh.set(true);
      }
      return readyRegistration;
    })
    .catch((error) => {
      console.warn("Service worker ready failed", error);
      return null;
    });
};

const close = () => {
  offlineReady.set(false);
  needRefresh.set(false);
};

const acceptRefresh = async () => {
  if (!registrationRef?.waiting) {
    close();
    return;
  }

  const controllerChanged = new Promise((resolve) => {
    if (!("serviceWorker" in navigator)) {
      resolve();
      return;
    }
    const onChange = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      resolve();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    setTimeout(resolve, 3000);
  });

  registrationRef.waiting.postMessage({ type: "SKIP_WAITING" });
  await controllerChanged;
  globalThis.location.reload();
};

const showNotification = async () => {
  alert(`supports push ${isPushNotificationSupported()}`);
  const result = await initializePushNotifications();
  notificationPermission.set(result);

  if (result !== "granted") return;

  if (registrationReady) {
    await registrationReady;
  }

  if (registrationRef) {
    sendNotification(registrationRef, mockedNotification);
  }
};

export {
  acceptRefresh,
  close,
  initNotifications,
  needRefresh,
  notificationPermission,
  showNotification,
};
