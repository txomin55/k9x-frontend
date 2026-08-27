import { createEffect, createSignal, onCleanup } from "solid-js";

const MIN_HEIGHT = 120;

const scrollParentOf = (node: HTMLElement) => {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
  }

  return null;
};

/**
 * Sizes an element to exactly the space left inside the scroll container it lives in, so its content
 * scrolls inside it and the page around it never gains a second scrollbar.
 *
 * Unlike measuring against the viewport, this also gives back whatever the ancestors reserve below the
 * element — the page's bottom padding that keeps the floating action button clear, for one — which is
 * space the element cannot take without pushing the page past its container.
 */
export function useFillRemainingHeight() {
  const [el, setEl] = createSignal<HTMLElement>();
  const [height, setHeight] = createSignal(MIN_HEIGHT);

  const update = () => {
    const node = el();
    if (!node) return;

    const scrollParent = scrollParentOf(node);
    const bottom = scrollParent
      ? scrollParent.getBoundingClientRect().bottom
      : window.innerHeight;

    let reservedBelow = 0;
    for (
      let parent = node.parentElement;
      parent && parent !== scrollParent;
      parent = parent.parentElement
    ) {
      reservedBelow += parseFloat(getComputedStyle(parent).paddingBottom) || 0;
    }

    // Clamp the top offset to >= 0 so a partially-scrolled-off element never yields a height taller
    // than the space it sits in.
    const top = Math.max(0, node.getBoundingClientRect().top);

    setHeight(Math.max(MIN_HEIGHT, Math.floor(bottom - top - reservedBelow)));
  };

  createEffect(() => {
    const node = el();
    if (!node) return;

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    const scrollParent = scrollParentOf(node);
    scrollParent?.addEventListener("scroll", update, { passive: true });

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(scrollParent ?? document.documentElement);

    onCleanup(() => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      scrollParent?.removeEventListener("scroll", update);
      observer?.disconnect();
    });
  });

  const ref = (node: HTMLElement) => {
    setEl(node);
    update();
  };

  return { ref, height, update };
}
