import {
  OFFLINE_PRELOAD_MESSAGE,
  OFFLINE_PRELOAD_RESPONSE_MESSAGE
} from "@/utils/service-worker/offline_bundle/offlinePreloadConstants";

export const APP_SHELL_CACHE = "app-shell-v1";

const CACHEABLE_EXTENSIONS =
  /\.(?:js|css|ico|png|svg|webp|woff2?|json|webmanifest|html)$/;
const PWA_BRANDING_ASSET_PATTERN =
  /(?:^|\/)(?:manifest\.webmanifest|k9x-192\.png|k9x-512\.png)$/;

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

const isPwaBrandingAssetRequest = (request) => {
  const url = new URL(request.url);
  return PWA_BRANDING_ASSET_PATTERN.test(url.pathname);
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

const cacheOfflineUrl = async (scope, requestUrl, cacheName) => {
  const url = new URL(requestUrl, scope.location.origin);

  if (url.origin !== scope.location.origin) {
    return;
  }

  const request = new Request(url.href, { credentials: "same-origin" });
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return;
  }

  const response = await fetch(request);

  if (!response.ok) {
    return;
  }

  await cache.put(request, response.clone());
};

const OFFLINE_PRELOAD_CONCURRENCY = 6;

const runWithConcurrencyLimit = async (items, limit, worker) => {
  const settled = new Array(items.length);
  let nextIndex = 0;

  const runNext = async () => {
    const index = nextIndex++;

    if (index >= items.length) {
      return;
    }

    try {
      settled[index] = { status: "fulfilled", value: await worker(items[index]) };
    } catch (reason) {
      settled[index] = { status: "rejected", reason };
    }

    await runNext();
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, runNext),
  );

  return settled;
};

const respondToWarmupRequest = (event, payload) => {
  const replyPort = event.ports?.[0];

  if (!replyPort) {
    return;
  }

  replyPort.postMessage({
    type: OFFLINE_PRELOAD_RESPONSE_MESSAGE,
    ...payload,
  });
};

export const registerAppShellCache = (scope) => {
  scope.addEventListener("message", (event) => {
    if (event.data.type !== OFFLINE_PRELOAD_MESSAGE) {
      return;
    }

    const urls = Array.isArray(event.data.urls) ? event.data.urls : [];

    event.waitUntil(
      runWithConcurrencyLimit(
        urls,
        OFFLINE_PRELOAD_CONCURRENCY,
        (url) => cacheOfflineUrl(scope, url, APP_SHELL_CACHE),
      ).then((results) => {
        const failedUrls = results.flatMap((result, index) =>
          result.status === "rejected" ? [urls[index]] : [],
        );

        respondToWarmupRequest(event, {
          failedUrls,
          ok: failedUrls.length === 0,
        });
      }),
    );
  });

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

    if (isPwaBrandingAssetRequest(request)) {
      event.respondWith(networkFirst(scope, request, APP_SHELL_CACHE));
      return;
    }

    event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE));
  });
};
