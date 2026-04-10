import type { JSX } from "solid-js";

export interface FloatingToggleProps {
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  toggled?: boolean;
  nonToggledText: string;
  toggledText?: string;
}
