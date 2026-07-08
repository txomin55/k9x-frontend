import { Show } from "solid-js";
import type { CoreSvgIconProps } from "@lib/components/atoms/svg-icon/AtomSvgIcon.types";
import "./styles.css";

export default function AtomSvgIcon(props: CoreSvgIconProps) {
  return (
    <Show
      when={props.tinted}
      fallback={
        <img class="atom-svg-icon" src={props.src} alt={props.alt ?? ""} />
      }
    >
      <span
        class="atom-svg-icon atom-svg-icon--tinted"
        role="img"
        aria-label={props.alt ?? ""}
        style={{
          "-webkit-mask-image": `url("${props.src}")`,
          "mask-image": `url("${props.src}")`,
        }}
      />
    </Show>
  );
}
