import * as TextField from "@kobalte/core/text-field";
import type { AtomTextAreaProps } from "@lib/components/atoms/text-area/AtomTextArea.types";
import "./styles.css";

export default function AtomTextArea(props: AtomTextAreaProps) {
  return (
    <TextField.Root
      class="atom-text-area"
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
        <TextField.Label class="atom-text-area__label">
          {props.label}
        </TextField.Label>
      ) : null}
      <TextField.TextArea
        autoResize={props.autoResize}
        class="atom-text-area__control"
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        rows={props.rows ?? 4}
      />
      {props.description ? (
        <TextField.Description class="atom-text-area__description">
          {props.description}
        </TextField.Description>
      ) : null}
      {props.errorMessage ? (
        <TextField.ErrorMessage class="atom-text-area__error-message">
          {props.errorMessage}
        </TextField.ErrorMessage>
      ) : null}
    </TextField.Root>
  );
}
