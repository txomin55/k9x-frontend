import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/stores/i18n/i18n";

describe("normalizeLocale", () => {
  it("returns a supported locale unchanged", () => {
    expect(normalizeLocale("es")).toBe("es");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("strips region subtags to the base locale", () => {
    expect(normalizeLocale("es-ES")).toBe("es");
    expect(normalizeLocale("es-419")).toBe("es");
    expect(normalizeLocale("EN-US")).toBe("en");
  });

  it("falls back to en for empty or unsupported input", () => {
    expect(normalizeLocale(undefined)).toBe("en");
    expect(normalizeLocale(null)).toBe("en");
    expect(normalizeLocale("")).toBe("en");
    expect(normalizeLocale("fr")).toBe("en");
    expect(normalizeLocale("de-DE")).toBe("en");
  });

  it("picks the first supported preference from a detected array", () => {
    expect(normalizeLocale(["fr", "es", "en-123"])).toBe("es");
    expect(normalizeLocale(["es-ES", "es", "en"])).toBe("es");
    expect(normalizeLocale(["de", "fr"])).toBe("en");
  });

  it("skips unsupported preferences before falling back", () => {
    expect(normalizeLocale(["fr-FR", "de", "en-GB"])).toBe("en");
    expect(normalizeLocale([null, "", "es"])).toBe("es");
  });
});
