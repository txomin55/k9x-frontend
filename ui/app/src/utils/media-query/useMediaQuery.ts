import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

export function useMediaQuery(query: string): Accessor<boolean> {
  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    onCleanup(() => mediaQuery.removeEventListener("change", sync));
  });

  return matches;
}
