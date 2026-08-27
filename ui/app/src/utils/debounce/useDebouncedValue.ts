import { createEffect, createSignal, onCleanup } from "solid-js";

/**
 * Trails a signal, only settling once it has stopped changing for `delay` ms. Used to keep a text input
 * responsive while what it drives — a request, a heavy recompute — waits for the typing to stop.
 */
export function useDebouncedValue<T>(source: () => T, delay = 300) {
  const [debounced, setDebounced] = createSignal<T>(source());

  createEffect(() => {
    const value = source();
    const timer = setTimeout(() => setDebounced(() => value), delay);

    onCleanup(() => clearTimeout(timer));
  });

  return debounced;
}
