import { resolveAppPath } from "@/utils/paths/app-paths";
import {
  OFFLINE_PRELOAD_MANIFEST_PATH,
  OFFLINE_PRELOAD_MESSAGE,
  OFFLINE_PRELOAD_RESPONSE_MESSAGE,
} from "@/utils/service_worker/offline_bundle/offlinePreloadConstants";

const OFFLINE_PRELOAD_SESSION_KEY = "k9x_offline_bundle_version";

type OfflinePreloadManifest = {
  version: string;
  assets: string[];
};

const isJsonLikeContentType = (contentType: string) =>
  contentType.includes("application/json") ||
  contentType.includes("application/manifest+json") ||
  contentType.includes("text/json");

const scheduleIdleTask = (callback: () => void) => {
  if ("requestIdleCallback" in globalThis) {
    globalThis.requestIdleCallback(callback, { timeout: 3_000 });
    return;
  }

  globalThis.setTimeout(callback, 250);
};

const isValidManifest = (
  manifest: Partial<OfflinePreloadManifest> | null | undefined,
): manifest is OfflinePreloadManifest =>
  Boolean(
    manifest &&
      typeof manifest.version === "string" &&
      Array.isArray(manifest.assets),
  );

const toAbsoluteAppUrl = (path: string) => {
  const resolvedPath = resolveAppPath(path);
  return new URL(resolvedPath, globalThis.location.origin).href;
};

const getCachedOfflineBundleVersion = () =>
  globalThis.sessionStorage.getItem(OFFLINE_PRELOAD_SESSION_KEY);

const setCachedOfflineBundleVersion = (version: string) => {
  globalThis.sessionStorage.setItem(OFFLINE_PRELOAD_SESSION_KEY, version);
};

const postOfflineWarmupMessage = async (
  serviceWorker: ServiceWorker,
  version: string,
  urls: string[],
) =>
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timeoutId = globalThis.setTimeout(() => {
      reject(new Error("Offline bundle warmup timed out"));
    }, 30_000);

    channel.port1.onmessage = (event) => {
      globalThis.clearTimeout(timeoutId);

      if (event.data?.type !== OFFLINE_PRELOAD_RESPONSE_MESSAGE) {
        reject(new Error("Unexpected offline bundle warmup response"));
        return;
      }

      if (!event.data.ok) {
        reject(
          new Error(
            `Offline bundle warmup failed for: ${event.data.failedUrls.join(", ")}`,
          ),
        );
        return;
      }

      resolve();
    };

    serviceWorker.postMessage(
      {
        type: OFFLINE_PRELOAD_MESSAGE,
        urls,
        version,
      },
      [channel.port2],
    );
  });

export const warmOfflineBundle = async (options?: { force?: boolean }) => {
  const force = options?.force ?? false;

  if (!("serviceWorker" in navigator)) {
    return;
  }

  const response = await fetch(resolveAppPath(OFFLINE_PRELOAD_MANIFEST_PATH), {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Offline preload manifest request failed with status ${response.status}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!isJsonLikeContentType(contentType)) {
    const responsePreview = (await response.text()).slice(0, 120).trim();

    throw new Error(
      `Offline preload manifest returned unexpected content-type "${contentType}" at ${resolveAppPath(
        OFFLINE_PRELOAD_MANIFEST_PATH,
      )}. Response starts with: ${responsePreview}`,
    );
  }

  const manifest = await response.json();

  if (!isValidManifest(manifest)) {
    throw new Error("Offline preload manifest has an invalid shape");
  }

  if (!force && getCachedOfflineBundleVersion() === manifest.version) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const serviceWorker =
    registration.active ?? registration.waiting ?? registration.installing;

  if (!serviceWorker) {
    return;
  }

  const urls = manifest.assets
    .map(toAbsoluteAppUrl)
    .filter((url, index, collection) => collection.indexOf(url) === index);

  await postOfflineWarmupMessage(serviceWorker, manifest.version, urls);
  setCachedOfflineBundleVersion(manifest.version);
};

export const warmOfflineBundleInBackground = (options?: { force?: boolean }) => {
  scheduleIdleTask(() => {
    warmOfflineBundle(options).catch(() => {});
  });
};
