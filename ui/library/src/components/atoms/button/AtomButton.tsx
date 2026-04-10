import "@lib/components/atoms/button/styles.css";
import type { JSX } from "solid-js";
import { Button } from "@kobalte/core/button";
import type { CoreButtonProps } from "@lib/components/atoms/button/AtomButton.types";

export const BUTTON_TYPES = {
  PRIMARY: "primary",
  ACCENT: "accent",
  DESTRUCTIVE: "destructive",
  GHOST: "ghost",
} as const;

export default function AtomButton(props: CoreButtonProps) {
  const disabled = () => Boolean(props.disabled);
  const typeClass = () => props.type ?? BUTTON_TYPES.PRIMARY;
  const className = () =>
    props.class
      ? `button ${typeClass()} ${props.class}`
      : `button ${typeClass()}`;

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    if (!disabled()) {
      props.onClick?.(event);
    }
  };

  return (
    <Button
      class={className()}
      disabled={disabled()}
      onClick={handleClick}
      style={props.style}
    >
      {props.children}
    </Button>
  );
}
