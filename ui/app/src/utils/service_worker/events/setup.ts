type ServiceWorkerSetupOptions = {
  cacheNames?: string[];
};

export const registerServiceWorkerSetup = (
  scope: ServiceWorkerGlobalScope,
  options: ServiceWorkerSetupOptions = {},
) => {
  const cacheNames = Array.isArray(options.cacheNames) ? options.cacheNames : [];

  scope.addEventListener("install", (event) => {
    event.waitUntil(scope.skipWaiting());
  });

  scope.addEventListener("message", (event) => {
    if (event.data.type === "SKIP_WAITING") {
      scope.skipWaiting();
    }
  });

  scope.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const existingCacheNames = await caches.keys();

        await Promise.all(
          existingCacheNames
            .filter((cacheName) => !cacheNames.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName)),
        );

        await scope.clients.claim();
      })(),
    );
  });
};
