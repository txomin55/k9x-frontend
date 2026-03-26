import type { JSX } from "solid-js";
import type { ButtonType } from "@lib/components/atoms/button/atomButton.constants";

export type CoreButtonProps = {
  children: JSX.Element;
  disabled?: boolean;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  type?: ButtonType;
};
