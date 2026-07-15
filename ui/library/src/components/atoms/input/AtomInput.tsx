import * as TextField from "@kobalte/core/text-field";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  placeholder?: string;
  min?: string;
  max?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "date";
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  validationState?: "valid" | "invalid";
};

export default function AtomInput(props: AtomInputProps) {
  return (
    <TextField.Root
      class="atom-input"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      name={props.name}
      onChange={props.onChange}
      readOnly={props.readOnly}
      required={props.required}
      validationState={props.validationState}
      value={props.value}
    >
      {props.label ? (
        <TextField.Label class="atom-input__label">
          {props.label}
        </TextField.Label>
      ) : null}
      <TextField.Input
        class="atom-input__control"
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        min={props.min}
        max={props.max}
        type={props.type ?? "text"}
      />
      {props.description ? (
        <TextField.Description class="atom-input__description">
          {props.description}
        </TextField.Description>
      ) : null}
      {props.errorMessage ? (
        <TextField.ErrorMessage class="atom-input__error-message">
          {props.errorMessage}
        </TextField.ErrorMessage>
      ) : null}
    </TextField.Root>
  );
}
