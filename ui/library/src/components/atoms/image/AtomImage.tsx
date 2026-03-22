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
      <Image.Img class="core-image__img" src={props.src} alt={props.alt} />
      <Image.Fallback class="core-image__fallback">
        {props.fallback}
      </Image.Fallback>
    </Image>
  );
};
