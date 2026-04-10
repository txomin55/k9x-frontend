import type { JSX } from "solid-js";

export type AtomSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type AtomSelectProps = {
  options: AtomSelectOption[];
  value?: AtomSelectOption | null;
  defaultValue?: AtomSelectOption;
  onChange?: (value: AtomSelectOption) => void;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: JSX.Element;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  disabled?: boolean;
  required?: boolean;
  validationState?: "valid" | "invalid";
};
