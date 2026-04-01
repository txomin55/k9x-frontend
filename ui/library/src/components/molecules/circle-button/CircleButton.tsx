import AtomButton from "@lib/components/atoms/button/AtomButton";
import type { CircleButtonProps } from "@lib/components/molecules/circle-button/CircleButton.types";
import "./styles.css";

export default function CircleButton(props: CircleButtonProps) {
  const sizeClass = () => {
    if (!props.size) return "circle-button circle-button--md";

    return `circle-button circle-button--${props.size}`;
  };

  return (
    <AtomButton
      class={sizeClass()}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </AtomButton>
  );
}
