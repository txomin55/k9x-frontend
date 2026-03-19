const reuseOrOpenWindow = async (scope, urlToOpen) => {
  const windowClients = await scope.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const [existingClient] = windowClients;
  if (existingClient) {
    await existingClient.navigate(urlToOpen);
    return existingClient.focus();
  }

  return scope.clients.openWindow(urlToOpen);
};

export const registerNotificationClickHandler = (scope) => {
  scope.addEventListener("notificationclick", (event) => {
    // Close the notification immediately for a snappier UI experience
    event.notification.close();

    const url = event.notification.data?.url;
    if (!url) return;

    // Resolve the absolute URL relative to the service worker's origin
    const urlToOpen = new URL(url, scope.location.origin).href;

    event.waitUntil(
      scope.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true, // Ensure we find tabs not yet controlled by this SW version
        })
        .then((clientList) => {
          // 1. Check if the specific URL is already open and focus it
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }

          // 2. If the App is open but on a different page, redirect and focus that window
          if (clientList.length > 0 && "navigate" in clientList[0]) {
            return clientList[0]
              .navigate(urlToOpen)
              .then((client) => client?.focus());
          }

          // 3. If no matching window is found, open the PWA in a new standalone window
          if (scope.clients.openWindow) {
            return scope.clients.openWindow(urlToOpen);
          }
        }),
    );
  });
};
