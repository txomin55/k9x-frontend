import "@lib/components/atoms/button/styles.css";
import type { JSX } from "solid-js";
import {
  BUTTON_TYPES,
  type ButtonType,
} from "@lib/components/atoms/button/button.constants";

export type CoreButtonProps = {
  disabled?: boolean;
  htmlType?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  label?: string;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  type?: ButtonType;
};

export default function CoreButton(props: CoreButtonProps) {
  const disabled = () => Boolean(props.disabled);
  const typeClass = () => props.type ?? BUTTON_TYPES.PRIMARY;

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    if (!disabled()) {
      props.onClick?.(event);
    }
  };

  return (
    <button
      class={`button ${typeClass()} ${disabled() ? "disabled" : ""}`.trim()}
      disabled={disabled()}
      onClick={handleClick}
      type={props.htmlType ?? "button"}
    >
      {props.label ?? ""}
    </button>
  );
}
