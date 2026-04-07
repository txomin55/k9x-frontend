import { APP_SHELL_CACHE } from "@/utils/service-worker/events/runtime-cache";

export const WARM_ANIMAL_ICONS = "WARM_ANIMAL_ICONS";

const isAnimalIconRequest = (scope, requestUrl) => {
  const url = new URL(requestUrl, scope.location.origin);

  return (
    url.origin === scope.location.origin &&
    /\/animals\/[^/]+\.svg$/.test(url.pathname)
  );
};

const cacheAnimalIcon = async (scope, requestUrl) => {
  const url = new URL(requestUrl, scope.location.origin);
  const request = new Request(url.href, { credentials: "same-origin" });
  const cache = await caches.open(APP_SHELL_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
};

export const registerAnimalIconCache = (scope) => {
  scope.addEventListener("message", (event) => {
    if (event.data.type !== WARM_ANIMAL_ICONS) {
      return;
    }

    const urls = Array.isArray(event.data.urls) ? event.data.urls : [];

    event.waitUntil(
      Promise.allSettled(
        urls
          .filter((url) => isAnimalIconRequest(scope, url))
          .map((url) => cacheAnimalIcon(scope, url)),
      ),
    );
  });
};
