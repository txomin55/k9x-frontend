import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { IconToggleButtonProps } from "@/components/common/icon-toggle-button/IconToggleButton.types";
import "@/components/common/icon-toggle-button/styles.css";

export default function IconToggleButton(props: IconToggleButtonProps) {
  const label = () => (props.active ? props.activeLabel : props.inactiveLabel);

  return (
    <button
      type="button"
      class="icon-toggle"
      classList={{ "icon-toggle--active": props.active }}
      title={label()}
      aria-pressed={props.active ? "true" : "false"}
      disabled={props.disabled}
      onClick={() => {
        if (props.disabled) return;
        props.onToggle?.();
      }}
    >
      <AtomSvgIcon src={props.src} alt={label()} />
    </button>
  );
}
