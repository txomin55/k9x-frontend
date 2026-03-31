import type { JSX } from "solid-js";

export type CircleButtonProps = {
  children: JSX.Element;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};
