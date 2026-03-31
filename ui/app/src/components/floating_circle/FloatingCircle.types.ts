import type { JSX } from "solid-js";

export interface FloatingCircleProps {
  children: JSX.Element;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
}
