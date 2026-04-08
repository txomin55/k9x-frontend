import type { JSX } from "solid-js";

export type AtomInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "date";
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  validationState?: "valid" | "invalid";
};
