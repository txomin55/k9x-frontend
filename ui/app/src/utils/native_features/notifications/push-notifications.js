function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

async function initializePushNotifications() {
  return await Notification.requestPermission();
}

function sendNotification(worker, notification) {
  worker.showNotification(notification.title, notification.options);
}

const handleNotification = (clients) => {
  return (event) => {
    if (event.action === "detail") {
      const urlToOpen = new URL(
        event.notification.data.url,
        self.location.origin,
      ).href;

      const promiseChain = clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          let matchingClient = null;

          for (const element of windowClients) {
            const windowClient = element;
            if (windowClient.url === urlToOpen) {
              matchingClient = windowClient;
              break;
            }
          }

          if (matchingClient) {
            return matchingClient.focus();
          } else {
            return clients.openWindow(urlToOpen);
          }
        });

      event.waitUntil(promiseChain);
    }
    event.notification.close();
  };
};
export {
  initializePushNotifications,
  sendNotification,
  isPushNotificationSupported,
  handleNotification,
};
