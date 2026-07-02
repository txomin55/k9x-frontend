import type { JSX } from "solid-js";
import type { ButtonType } from "@lib/components/atoms/button/AtomButton.types";

export type CircleButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  size?: CircleButtonPropsSize;
  type?: ButtonType;
};

export type CircleButtonPropsSize = "sm" | "md" | "lg";
