const ACCESS_TOKEN_KEY = "k9x_access_token";

export const hasAuthenticatedSession = () =>
  typeof globalThis !== "undefined" &&
  Boolean(globalThis.localStorage.getItem(ACCESS_TOKEN_KEY));

export const isOffline = () =>
  typeof globalThis !== "undefined" &&
  "navigator" in globalThis &&
  !globalThis.navigator.onLine;

export const shouldReadFromIndexedDb = () =>
  hasAuthenticatedSession() && isOffline();

export const shouldPersistLocalFirstData = () => hasAuthenticatedSession();

export const shouldQueueOfflineMutation = () =>
  hasAuthenticatedSession() && isOffline();
