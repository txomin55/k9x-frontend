import AtomImage from "@lib/components/atoms/image/AtomImage";
import type { ProfileImageProps } from "@lib/components/molecules/profile-image/ProfileImage.types";
import "./styles.css";

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
