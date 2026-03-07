export const notificationListeners = () => {
  self.addEventListener("notificationclick", (event) => {
    if (event.action === "detail") {
      const urlToOpen = new URL(
        event.notification.data.url,
        self.location.origin,
      ).href;

      const promiseChain = globalThis.clients
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
            return globalThis.clients.openWindow(urlToOpen);
          }
        });

      event.waitUntil(promiseChain);
    }
    event.notification.close();
  });
};

export const messageListeners = () => {
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      globalThis.skipWaiting();
    }
  });
};

notificationListeners();
messageListeners();
