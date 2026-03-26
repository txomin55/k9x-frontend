import { Image } from "@kobalte/core/image";
import type { AtomImageProps } from "@lib/components/atoms/image/AtomImage.types";

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
