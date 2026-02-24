import React, { createContext, useContext } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  initializePushNotifications,
  isPushNotificationSupported,
  sendNotification,
} from "@/utils/native_features/notifications/push-notifications.js";
import mockedNotification from "@/components/reload_prompt/mockedNotification.js";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  let worker;

  const { updateServiceWorker, needRefresh, offlineReady } = useRegisterSW({
    immediate: true,
    onRegistered: (r) => {
      alert("Worker registered");
      worker = r;
    },
    onRegisterError: (error) => {
      alert(`SW registration error ${error}`);
    },
  });
  const setOfflineReady = offlineReady[1];
  const [appNeedRefresh, setAppNeedRefresh] = needRefresh;

  const close = () => {
    setOfflineReady(false);
    setAppNeedRefresh(false);
  };

  const acceptRefresh = async () => {
    await updateServiceWorker(true);
    close();
  };

  const showNotification = async () => {
    alert(`supports push ${isPushNotificationSupported()}`);
    const result = await initializePushNotifications();
    if (result === "granted") {
      sendNotification(worker, mockedNotification);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        needRefresh: appNeedRefresh,
        acceptRefresh,
        showNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationsContext);
};
