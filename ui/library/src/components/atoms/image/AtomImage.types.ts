import type { JSX } from "solid-js";

export type AtomImageProps = {
  src?: string | null;
  alt?: string | null;
  fallback?: string | null;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};
