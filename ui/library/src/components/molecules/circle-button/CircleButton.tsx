import type { JSX } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import type { ButtonType } from "@lib/components/atoms/button/AtomButton";
import "./styles.css";

export type CircleButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  size?: CircleButtonPropsSize;
  type?: ButtonType;
  ariaLabel?: string;
};

export type CircleButtonPropsSize = "sm" | "md" | "lg";

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
      type={props.type}
      ariaLabel={props.ariaLabel}
    >
      {props.children}
    </AtomButton>
  );
}
