import { Image } from "@kobalte/core/image";
import type { JSX } from "solid-js";

export type AtomImageProps = {
  src?: string | null;
  alt?: string | null;
  fallback?: string | null;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};

export default (props: AtomImageProps) => {
  return (
    <Image fallbackDelay={600} class="core-image">
      <Image.Img
        class="core-image__img"
        src={props.src ?? undefined}
        alt={props.alt ?? undefined}
      />
      <Image.Fallback class="core-image__fallback">
        {props.fallback}
      </Image.Fallback>
    </Image>
  );
};
