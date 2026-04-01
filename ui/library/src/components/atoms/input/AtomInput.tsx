import * as TextField from "@kobalte/core/text-field";
import type { AtomInputProps } from "@lib/components/atoms/input/AtomInput.types";
import "./styles.css";

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
