import { promises as fs } from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve(".output/public");

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

const main = async () => {
  const basePath = normalizeBasePath(process.env.VITE_APP_BASE_PATH);

  if (!basePath) {
    return;
  }

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
};

await main();
