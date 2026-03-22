import "@lib/components/atoms/button/styles.css";
import type { JSX } from "solid-js";
import {
  BUTTON_TYPES,
  type ButtonType,
} from "@lib/components/atoms/button/atomButton.constants";
import { Button } from "@kobalte/core/button";

export type CoreButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  type?: ButtonType;
};

export default function AtomButton(props: CoreButtonProps) {
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
    <Button
      class={`button ${typeClass()}`}
      disabled={disabled()}
      onClick={handleClick}
    >
      {props.children}
    </Button>
  );
}
