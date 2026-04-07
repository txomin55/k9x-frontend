import { afterEach, describe, expect, it } from "vitest";
import {
  hasAuthenticatedSession,
  shouldPersistLocalFirstData,
  shouldQueueOfflineMutation,
  shouldReadFromIndexedDb,
} from "@/utils/local-first/localFirstPolicy";

const ACCESS_TOKEN_KEY = "k9x_access_token";

const setNavigatorOnline = (online: boolean) => {
  Object.defineProperty(globalThis.navigator, "onLine", {
    configurable: true,
    value: online,
  });
};

describe("localFirstPolicy", () => {
  afterEach(() => {
    globalThis.localStorage.clear();
    setNavigatorOnline(true);
  });

  it("only reads from indexeddb when the user is authenticated and offline", () => {
    expect(shouldReadFromIndexedDb()).toBe(false);

    globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, "token");
    expect(hasAuthenticatedSession()).toBe(true);
    expect(shouldPersistLocalFirstData()).toBe(true);
    expect(shouldReadFromIndexedDb()).toBe(false);

    setNavigatorOnline(false);

    expect(shouldReadFromIndexedDb()).toBe(true);
    expect(shouldQueueOfflineMutation()).toBe(true);
  });

  it("does not queue offline mutations without an authenticated session", () => {
    setNavigatorOnline(false);

    expect(shouldPersistLocalFirstData()).toBe(false);
    expect(shouldReadFromIndexedDb()).toBe(false);
    expect(shouldQueueOfflineMutation()).toBe(false);
  });
});
