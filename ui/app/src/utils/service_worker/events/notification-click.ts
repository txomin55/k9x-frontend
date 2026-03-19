const reuseOrOpenWindow = async (scope, urlToOpen) => {
  const windowClients = await scope.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  // Check if any window is already open within our PWA scope
  for (const client of windowClients) {
    // On mobile, focusing an existing client is better than opening a new one
    if ("navigate" in client && "focus" in client) {
      await client.navigate(urlToOpen);
      return client.focus();
    }
  }

  // If no window is found, this MUST be within the manifest scope to stay in the PWA
  if (scope.clients.openWindow) {
    return scope.clients.openWindow(urlToOpen);
  }
};

export const registerNotificationClickHandler = (scope) => {
  scope.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const dataUrl = event.notification.data?.url;
    if (!dataUrl) return;

    const urlToOpen = new URL(dataUrl, scope.registration.scope).href;

    event.waitUntil(reuseOrOpenWindow(scope, urlToOpen));
  });
};
