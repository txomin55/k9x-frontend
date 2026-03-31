import type { JSX } from "solid-js";

export type AtomCollapsibleProps = {
  trigger: JSX.Element;
  content: JSX.Element;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};
