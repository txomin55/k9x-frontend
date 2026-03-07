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

let updateServiceWorker = null;
let worker = null;
let registrationRef = null;
let workerReady = null;
let initialized = false;

const initNotifications = async () => {
  if (initialized) return;
  initialized = true;

  if ("serviceWorker" in navigator) {
    const swPath = import.meta.env.DEV ? "/sw-dev.js" : "/sw.js";
    const swUrl = new URL(resolve(swPath), globalThis.location.origin);
    const scope = resolve("/");
    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope,
        type: "module",
      });
      registrationRef = registration;
      if (!worker) worker = registration;

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              needRefresh.set(true);
            } else {
              offlineReady.set(true);
            }
          }
        });
      });
    } catch (error) {
      console.error("Service worker registration failed", error);
    }

    workerReady = navigator.serviceWorker.ready
      .then((registration) => {
        if (!worker) {
          worker = registration;
        }
        return registration;
      })
      .catch((error) => {
        console.error("Service worker ready failed", error);
        return null;
      });
  }

  updateServiceWorker = async () => {
    if (!registrationRef) return;
    await registrationRef.update();
    if (registrationRef.waiting) {
      registrationRef.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };
};

const close = () => {
  offlineReady.set(false);
  needRefresh.set(false);
};

const acceptRefresh = async () => {
  if (updateServiceWorker) {
    await updateServiceWorker();
    if (registrationRef?.waiting) {
      registrationRef.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    globalThis.location.reload();
  }
  close();
};

const showNotification = async () => {
  alert(`supports push ${isPushNotificationSupported()}`);
  const result = await initializePushNotifications();
  if (result === "granted" && !worker && workerReady) {
    await workerReady;
  }

  if (result === "granted" && worker) {
    sendNotification(worker, mockedNotification);
  }
};

export {
  acceptRefresh,
  close,
  initNotifications,
  needRefresh,
  showNotification,
};
