import * as NumberField from "@kobalte/core/number-field";
import type { JSX } from "solid-js";
import "./styles.css";

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

export default function AtomNumberInput(props: AtomNumberInputProps) {
  return (
    <NumberField.Root
      class="atom-number-input"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      formatOptions={{ maximumFractionDigits: 2 }}
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
        <NumberField.Input
          class="atom-number-input__control"
          onBlur={props.onBlur}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder={props.placeholder}
        />
        <NumberField.HiddenInput />
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
