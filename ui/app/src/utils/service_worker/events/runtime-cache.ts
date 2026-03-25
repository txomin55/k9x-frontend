export const APP_SHELL_CACHE = "app-shell-v1";

const CACHEABLE_EXTENSIONS =
  /\.(?:js|css|ico|png|svg|webp|woff2?|json|webmanifest|html)$/;

const isCacheableAssetRequest = (scope, request) => {
  const url = new URL(request.url);

  if (url.origin !== scope.location.origin) {
    return false;
  }

  if (request.mode === "navigate") {
    return true;
  }

  return CACHEABLE_EXTENSIONS.test(url.pathname);
};

const getAppShellRequest = (scope) => {
  const appShellUrl = new URL(scope.registration.scope);
  return new Request(appShellUrl.href, { credentials: "same-origin" });
};

const networkFirst = async (scope, request, cacheName) => {
  const cache = await caches.open(cacheName);
  const appShellRequest = getAppShellRequest(scope);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
      if (request.mode === "navigate") {
        await cache.put(appShellRequest, response.clone());
      }
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === "navigate") {
      const appShellResponse = await cache.match(appShellRequest);
      if (appShellResponse) {
        return appShellResponse;
      }
    }

    return Response.error();
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
};

export const registerAppShellCache = (scope) => {
  scope.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
      return;
    }

    if (!isCacheableAssetRequest(scope, request)) {
      return;
    }

    if (request.mode === "navigate") {
      event.respondWith(networkFirst(scope, request, APP_SHELL_CACHE));
      return;
    }

    event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE));
  });
};
