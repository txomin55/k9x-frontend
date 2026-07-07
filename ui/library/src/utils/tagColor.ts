import type { JSX } from "solid-js";

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

function hashString(value: string): number {
  let hash = 5381;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }

  return Math.abs(hash);
}

function hashToHue(value: string): number {
  const fraction =
    (hashString(value) * GOLDEN_RATIO_CONJUGATE) % 1;

  return Math.floor(fraction * 360);
}

export function getTagColorStyle(value: string): JSX.CSSProperties {
  const hue = hashToHue(value);

  return {
    "--tag-color-bg-light": `hsl(${hue}, 65%, 90%)`,
    "--tag-color-border-light": `hsl(${hue}, 55%, 55%)`,
    "--tag-color-text-light": `hsl(${hue}, 65%, 25%)`,
    "--tag-color-bg-dark": `hsl(${hue}, 45%, 22%)`,
    "--tag-color-border-dark": `hsl(${hue}, 50%, 45%)`,
    "--tag-color-text-dark": `hsl(${hue}, 60%, 85%)`,
  } as JSX.CSSProperties;
}
