import "@lib/components/atoms/button/styles.css";
import type { JSX } from "solid-js";
import { Button } from "@kobalte/core/button";

export type CoreButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  type?: ButtonType;
  size?: ButtonSize;
  class?: string;
  style?: JSX.CSSProperties;
};

export type ButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
export type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];

export const BUTTON_TYPES = {
  PRIMARY: "primary",
  ACCENT: "accent",
  DESTRUCTIVE: "destructive",
  GHOST: "ghost",
  WARNING: "warning",
} as const;

export const BUTTON_SIZES = {
  MD: "md",
  SM: "sm",
} as const;

export default function AtomButton(props: CoreButtonProps) {
  const disabled = () => Boolean(props.disabled);
  const typeClass = () => props.type ?? BUTTON_TYPES.PRIMARY;
  const sizeClass = () => props.size ?? BUTTON_SIZES.SM;
  const className = () =>
    props.class
      ? `atom-button ${typeClass()} ${sizeClass()} ${props.class}`
      : `atom-button ${typeClass()} ${sizeClass()}`;

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
      <span>{props.children}</span>
    </Button>
  );
}
