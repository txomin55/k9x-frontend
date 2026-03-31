import { createHash } from "node:crypto";

const OFFLINE_PRELOAD_EXCLUDED_PATHS = new Set([
  "/sw.js",
  "/offline-preload-manifest.json",
  "/.nojekyll",
]);

const normalizePublicFilePath = (filePath: string) => {
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  if (normalizedPath === "/index.html") {
    return "/";
  }

  if (normalizedPath.endsWith("/index.html")) {
    return normalizedPath.slice(0, -"/index.html".length) || "/";
  }

  return normalizedPath;
};

export const shouldIncludeInOfflinePreload = (filePath: string) => {
  if (!filePath || filePath.endsWith(".map")) {
    return false;
  }

  return !OFFLINE_PRELOAD_EXCLUDED_PATHS.has(normalizePublicFilePath(filePath));
};

export const createOfflinePreloadManifest = (publicFilePaths: string[]) => {
  const assets = [...new Set(publicFilePaths.map(normalizePublicFilePath))]
    .filter(shouldIncludeInOfflinePreload)
    .sort();
  const version = createHash("sha256")
    .update(JSON.stringify({ assets }))
    .digest("hex")
    .slice(0, 12);

  return {
    version,
    assets,
  };
};
