import type { JSX } from "solid-js";
import AtomImage from "@lib/components/atoms/image/AtomImage";
import "./styles.css";

export type ProfileImageProps = {
  src?: string | null;
  alt?: string | null;
  fallback?: string | null;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};

export default (props: ProfileImageProps) => (
  <div class="profile-image">
    <AtomImage
      alt={props.alt}
      src={props.src}
      onClick={props.onClick}
      fallback={props.fallback}
    />
  </div>
);
