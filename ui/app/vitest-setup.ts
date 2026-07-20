import type { ParentProps } from "solid-js";
import "my-vitest/vitest-setup";
import { vi } from "vitest";

class InMemoryStorage implements Storage {
  #store = new Map<string, string>();

  get length() {
    return this.#store.size;
  }

  clear() {
    this.#store.clear();
  }

  getItem(key: string) {
    return this.#store.has(key) ? this.#store.get(key)! : null;
  }

  key(index: number) {
    return [...this.#store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.#store.delete(key);
  }

  setItem(key: string, value: string) {
    this.#store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage?.getItem !== "function") {
  const storage = new InMemoryStorage();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });

  if (typeof globalThis.window !== "undefined") {
    Object.defineProperty(globalThis.window, "localStorage", {
      configurable: true,
      value: storage,
    });
  }
}

if (
  typeof globalThis.window !== "undefined" &&
  typeof globalThis.window.matchMedia !== "function"
) {
  Object.defineProperty(globalThis.window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

vi.mock("@solidjs/meta", () => ({
  MetaProvider: (props: ParentProps) => props.children,
  Title: () => null,
}));
