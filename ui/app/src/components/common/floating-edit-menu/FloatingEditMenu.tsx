import { Show } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import configIcon from "@/assets/miscelaneous/config.svg";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import arrowBackIcon from "@/assets/miscelaneous/arrow-back.svg";

export interface FloatingEditMenuProps {
  editing: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onEditToggle: () => void;
  configLabel: string;
  editLabel: string;
  viewLabel: string;
}

export default function FloatingEditMenu(props: FloatingEditMenuProps) {
  return (
    <>
      <div class="floating-action floating-action--level-0">
        <button
          type="button"
          class="floating-action__trigger"
          aria-label={props.configLabel}
          aria-expanded={props.menuOpen}
          onClick={() => props.onMenuToggle()}
        >
          <span class="floating-action__circle">
            <AtomSvgIcon src={configIcon} alt={props.configLabel} tinted />
          </span>
        </button>
      </div>
      <Show when={props.menuOpen}>
        <div class="floating-action floating-action--level-1">
          <button
            type="button"
            class="floating-action__trigger"
            aria-label={props.editing ? props.viewLabel : props.editLabel}
            onClick={() => props.onEditToggle()}
          >
            <span class="floating-action__circle">
              <AtomSvgIcon
                src={props.editing ? arrowBackIcon : pencilIcon}
                alt={props.editing ? props.viewLabel : props.editLabel}
                tinted
              />
            </span>
          </button>
        </div>
      </Show>
    </>
  );
}
