type StoredFilters = Record<string, string>;

const getSessionStorage = () => {
  try {
    return globalThis.sessionStorage ?? undefined;
  } catch {
    return undefined;
  }
};

export const readStoredFilters = (storageKey: string): StoredFilters => {
  const storage = getSessionStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([key, value]) => [key, value as string]),
    );
  } catch {
    return {};
  }
};

export const storeFilter = (
  storageKey: string,
  field: string,
  value: string,
) => {
  const storage = getSessionStorage();
  if (!storage) return;

  const next = readStoredFilters(storageKey);
  if (value) {
    next[field] = value;
  } else {
    delete next[field];
  }

  try {
    storage.setItem(storageKey, JSON.stringify(next));
  } catch {
    return;
  }
};
