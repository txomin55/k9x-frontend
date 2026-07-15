import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import "@/components/common/icon-toggle-button/styles.css";

export type IconToggleButtonProps = {
  src: string;
  activeLabel: string;
  inactiveLabel: string;
  active?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
};

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
      <AtomSvgIcon src={props.src} alt={label()} tinted />
    </button>
  );
}
