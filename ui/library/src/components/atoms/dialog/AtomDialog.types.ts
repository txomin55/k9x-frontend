import type { JSX } from "solid-js";

export type AtomDialogProps = {
  trigger: JSX.Element;
  title?: JSX.Element;
  description?: JSX.Element;
  content: JSX.Element;
  closeButtonText?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  modal?: boolean;
};
