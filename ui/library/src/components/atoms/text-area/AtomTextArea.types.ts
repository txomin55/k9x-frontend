import type { JSX } from "solid-js";

export type AtomTextAreaProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: JSX.FocusEventHandlerUnion<HTMLTextAreaElement, FocusEvent>;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  rows?: number;
  autoResize?: boolean;
  validationState?: "valid" | "invalid";
};
