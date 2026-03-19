const getAppUrlToOpen = (scope, rawUrl) => {
  const appScopeUrl = new URL(scope.registration.scope);
  const requestedUrl = new URL(rawUrl, appScopeUrl);
  const appScopePathname = appScopeUrl.pathname.replace(/\/$/, "") || "/";
  const requestedPathname = requestedUrl.pathname.replace(/\/$/, "") || "/";

  if (requestedUrl.origin !== appScopeUrl.origin) {
    return appScopeUrl.href;
  }

  if (
    requestedUrl.href.startsWith(appScopeUrl.href) ||
    requestedPathname === appScopePathname
  ) {
    return requestedUrl.href;
  }

  return new URL(
    `${appScopeUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`,
    appScopeUrl.origin,
  ).href;
};

const reuseOrOpenWindow = async (scope, urlToOpen) => {
  const windowClients = await scope.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    if ("navigate" in client && "focus" in client) {
      await client.navigate(urlToOpen);
      return client.focus();
    }
  }

  if (scope.clients.openWindow) {
    return scope.clients.openWindow(urlToOpen);
  }
};

export const registerNotificationClickHandler = (scope) => {
  scope.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const dataUrl = event.notification.data?.url;
    if (!dataUrl) return;

    const urlToOpen = getAppUrlToOpen(scope, dataUrl);

    event.waitUntil(reuseOrOpenWindow(scope, urlToOpen));
  });
};
