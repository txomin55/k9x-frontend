import { Combobox } from "@kobalte/core/combobox";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomComboboxOption = {
  label: string;
  value: string;
  disabled?: boolean;
  preLabel?: JSX.Element;
};

export type AtomComboboxProps = {
  options: AtomComboboxOption[];
  value?: AtomComboboxOption | null;
  defaultValue?: AtomComboboxOption;
  onChange?: (value: AtomComboboxOption | null) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  disabled?: boolean;
  validationState?: "valid" | "invalid";
};

export function AtomCombobox(props: AtomComboboxProps) {
  return (
    <Combobox
      class="atom-combobox"
      defaultValue={props.defaultValue}
      aria-label={props.label ?? "--Combobox"}
      disabled={props.disabled}
      triggerMode="focus"
      validationState={props.validationState}
      options={props.options}
      optionDisabled="disabled"
      optionLabel="label"
      optionTextValue="label"
      optionValue="value"
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      itemComponent={(itemProps) => (
        <Combobox.Item item={itemProps.item} class="atom-combobox__item">
          <div class="atom-combobox__item-option">
            {itemProps.item.rawValue.preLabel}
            <Combobox.ItemLabel class="atom-combobox__item-label">
              {itemProps.item.rawValue.label}
            </Combobox.ItemLabel>
          </div>
          <Combobox.ItemIndicator class="atom-combobox__item-indicator">
            x
          </Combobox.ItemIndicator>
        </Combobox.Item>
      )}
    >
      {props.label ? (
        <Combobox.Label class="atom-combobox__label">
          {props.label}
        </Combobox.Label>
      ) : null}
      <Combobox.Control class="atom-combobox__control">
        <Combobox.Input class="atom-combobox__input" />
        <Combobox.Trigger>
          <Combobox.Icon class="atom-combobox__icon">^</Combobox.Icon>
        </Combobox.Trigger>
      </Combobox.Control>
      {props.description ? (
        <Combobox.Description class="atom-combobox__description">
          {props.description}
        </Combobox.Description>
      ) : null}
      {props.errorMessage ? (
        <Combobox.ErrorMessage class="atom-combobox__error-message">
          {props.errorMessage}
        </Combobox.ErrorMessage>
      ) : null}
      <Combobox.Portal>
        <Combobox.Content class="atom-combobox__content">
          <Combobox.Listbox class="atom-combobox__listbox" />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
