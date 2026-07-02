import type { JSX } from "solid-js";
import { BUTTON_SIZES, BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";

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
