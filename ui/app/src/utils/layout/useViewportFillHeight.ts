import { createSignal, onCleanup, onMount } from "solid-js";
import { useDeviceType } from "@/utils/media-query/useDeviceType";

const MIN_HEIGHT = 120;

/**
 * Sizes an element to fill the remaining viewport height below its own top
 * edge, so its content scrolls inside it while everything above (filters,
 * headers) stays pinned. Mirrors the classification list/table sizing.
 */
export function useViewportFillHeight() {
  const device = useDeviceType();
  const isMobile = () => device() === "mobile";

  const [el, setEl] = createSignal<HTMLElement>();
  const [height, setHeight] = createSignal(MIN_HEIGHT);

  const update = () => {
    const node = el();
    if (!node) return;
    const bottomGap = isMobile() ? 64 : 16;
    // Clamp the top offset to >= 0 so a partially-scrolled-off element never
    // yields a height taller than the viewport itself.
    const top = Math.max(0, node.getBoundingClientRect().top);
    setHeight(
      Math.max(MIN_HEIGHT, Math.floor(window.innerHeight - top - bottomGap)),
    );
  };

  onMount(() => {
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    onCleanup(() => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    });
  });

  const ref = (node: HTMLElement) => {
    setEl(node);
    update();
  };

  return { ref, height, update };
}
