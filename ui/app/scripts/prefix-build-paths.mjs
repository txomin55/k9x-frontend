import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const OUTPUT_DIR = path.resolve(".output/public");
const OFFLINE_PRELOAD_MANIFEST_PATH = "/offline-preload-manifest.json";
const OFFLINE_PRELOAD_EXCLUDED_PATHS = new Set([
  "/sw.js",
  OFFLINE_PRELOAD_MANIFEST_PATH,
  "/.nojekyll",
]);

const normalizeBasePath = (value = "") => {
  if (!value) return "";

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};

const prefixHtmlAssetPaths = (html, basePath) => {
  if (!basePath) return html;

  return html
    .replace(/(["'])\/(_build\/)/g, `$1${basePath}/$2`)
    .replace(
      /(["'])\/(favicon\.svg|manifest\.webmanifest|robots\.txt|sw\.js|pwa-192x192\.png|pwa-512x512\.png)/g,
      `$1${basePath}/$2`,
    );
};

const walkHtmlFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkHtmlFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
    }),
  );

  return files.flat();
};

const walkAllFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkAllFiles(entryPath);
      }

      return entry.isFile() ? [entryPath] : [];
    }),
  );

  return files.flat();
};

const toPublicPath = (filePath) => {
  const relativePath = path.relative(OUTPUT_DIR, filePath);
  return `/${relativePath.split(path.sep).join("/")}`;
};

const normalizePublicFilePath = (filePath) => {
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  if (normalizedPath === "/index.html") {
    return "/";
  }

  if (normalizedPath.endsWith("/index.html")) {
    return normalizedPath.slice(0, -"/index.html".length) || "/";
  }

  return normalizedPath;
};

const shouldIncludeInOfflinePreload = (filePath) => {
  if (!filePath || filePath.endsWith(".map")) {
    return false;
  }

  return !OFFLINE_PRELOAD_EXCLUDED_PATHS.has(normalizePublicFilePath(filePath));
};

const createOfflinePreloadManifest = (publicFilePaths) => {
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

const writeOfflinePreloadManifest = async () => {
  const allFiles = await walkAllFiles(OUTPUT_DIR);
  const manifest = createOfflinePreloadManifest(allFiles.map(toPublicPath));

  await fs.writeFile(
    path.join(OUTPUT_DIR, OFFLINE_PRELOAD_MANIFEST_PATH.slice(1)),
    JSON.stringify(manifest, null, 2),
  );
};

const main = async () => {
  const basePath = normalizeBasePath(process.env.VITE_APP_BASE_PATH);

  const htmlFiles = await walkHtmlFiles(OUTPUT_DIR);

  await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const originalHtml = await fs.readFile(htmlFile, "utf8");
      const prefixedHtml = prefixHtmlAssetPaths(originalHtml, basePath);

      if (prefixedHtml !== originalHtml) {
        await fs.writeFile(htmlFile, prefixedHtml);
      }
    }),
  );

  if (!basePath) {
    await writeOfflinePreloadManifest();
    return;
  }

  await writeOfflinePreloadManifest();
};

await main();
