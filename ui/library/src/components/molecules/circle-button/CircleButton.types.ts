import type { JSX } from "solid-js";

export type CircleButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  size?: "sm" | "md" | "lg";
};
