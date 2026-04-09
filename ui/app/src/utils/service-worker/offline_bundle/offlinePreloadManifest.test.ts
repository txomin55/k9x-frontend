import { describe, expect, it } from "vitest";
import {
  createOfflinePreloadManifest,
  shouldIncludeInOfflinePreload,
} from "@/utils/service-worker/offline_bundle/offlinePreloadManifest";

describe("offlinePreloadManifest", () => {
  it("includes every public file needed for offline mode", () => {
    const manifest = createOfflinePreloadManifest([
      "/_build/assets/main-123.js",
      "/_build/assets/main-123.css",
      "/_build/assets/competitions-456.js",
      "/img/icons/favicon.svg",
      "/index.html",
      "/competitions/index.html",
      "/locales/es/translation.json",
      "/manifest.webmanifest",
      "/sw.js",
      "/offline-preload-manifest.json",
      "/_build/assets/main-123.js.map",
    ]);

    expect(manifest.assets).toEqual([
      "/",
      "/_build/assets/main-123.css",
      "/_build/assets/main-123.js",
      "/_build/assets/competitions-456.js",
      "/img/icons/favicon.svg",
      "/locales/es/translation.json",
      "/manifest.webmanifest",
      "/competitions",
    ]);
    expect(manifest.version).toHaveLength(12);
  });

  it("filters out excluded files from the preload manifest", () => {
    expect(shouldIncludeInOfflinePreload("sw.js")).toBe(false);
    expect(shouldIncludeInOfflinePreload("offline-preload-manifest.json")).toBe(
      false,
    );
    expect(shouldIncludeInOfflinePreload("assets/main.js.map")).toBe(false);
    expect(shouldIncludeInOfflinePreload("assets/data.txt")).toBe(true);
    expect(shouldIncludeInOfflinePreload("competitions/index.html")).toBe(true);
  });
});
