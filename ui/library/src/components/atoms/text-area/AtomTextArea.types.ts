import type { JSX } from "solid-js";

export type AtomTextAreaProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
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
