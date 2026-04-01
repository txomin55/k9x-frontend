import type { JSX } from "solid-js";

export type AtomNumberInputProps = {
  value?: string | number;
  defaultValue?: string | number;
  rawValue?: number;
  onChange?: (value: string) => void;
  onRawValueChange?: (value: number) => void;
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  largeStep?: number;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  validationState?: "valid" | "invalid";
};
