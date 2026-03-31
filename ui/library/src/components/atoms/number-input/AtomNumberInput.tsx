import * as NumberField from "@kobalte/core/number-field";
import type { AtomNumberInputProps } from "@lib/components/atoms/number-input/AtomNumberInput.types";
import "./styles.css";

export default function AtomNumberInput(props: AtomNumberInputProps) {
  return (
    <NumberField.Root
      class="atom-number-input"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      largeStep={props.largeStep}
      maxValue={props.maxValue}
      minValue={props.minValue}
      name={props.name}
      onChange={props.onChange}
      onRawValueChange={props.onRawValueChange}
      rawValue={props.rawValue}
      readOnly={props.readOnly}
      required={props.required}
      step={props.step}
      validationState={props.validationState}
      value={props.value}
    >
      {props.label ? (
        <NumberField.Label class="atom-number-input__label">
          {props.label}
        </NumberField.Label>
      ) : null}
      <div class="atom-number-input__field">
        <NumberField.DecrementTrigger class="atom-number-input__trigger">
          -
        </NumberField.DecrementTrigger>
        <NumberField.Input
          class="atom-number-input__control"
          placeholder={props.placeholder}
        />
        <NumberField.HiddenInput />
        <NumberField.IncrementTrigger class="atom-number-input__trigger">
          +
        </NumberField.IncrementTrigger>
      </div>
      {props.description ? (
        <NumberField.Description class="atom-number-input__description">
          {props.description}
        </NumberField.Description>
      ) : null}
      {props.errorMessage ? (
        <NumberField.ErrorMessage class="atom-number-input__error-message">
          {props.errorMessage}
        </NumberField.ErrorMessage>
      ) : null}
    </NumberField.Root>
  );
}
