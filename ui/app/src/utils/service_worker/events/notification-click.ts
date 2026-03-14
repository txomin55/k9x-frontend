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
    const url = event.notification.data?.url;
    if (!url) {
      event.notification.close();
      return;
    }

    const urlToOpen = new URL(url, scope.location.origin).href;

    event.waitUntil(reuseOrOpenWindow(scope, urlToOpen));

    event.notification.close();
  });
};
