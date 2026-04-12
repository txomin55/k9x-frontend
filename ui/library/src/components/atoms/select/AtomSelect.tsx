import * as Select from "@kobalte/core/select";
import type {
  AtomSelectOption,
  AtomSelectProps,
} from "@lib/components/atoms/select/AtomSelect.types";
import "./styles.css";
import { Show } from "solid-js";

export default function AtomSelect(props: AtomSelectProps) {
  const getItemPreLabel = (idx: number) => props.options[idx].preLabel;
  return (
    <Select.Root<AtomSelectOption>
      class="atom-select"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      gutter={8}
      onChange={props.onChange}
      onOpenChange={props.onOpenChange}
      open={props.open}
      optionDisabled="disabled"
      optionTextValue="label"
      optionValue="value"
      options={props.options}
      placeholder={props.placeholder ?? "--Select an option"}
      required={props.required}
      sameWidth
      validationState={props.validationState}
      value={props.value}
      itemComponent={(itemProps) => (
        <Select.Item class="atom-select__item" item={itemProps.item}>
          <div class="atom-select__item-option">
            <Show when={getItemPreLabel(itemProps.item.index)}>
              {getItemPreLabel(itemProps.item.index)}
            </Show>
            <Select.ItemLabel class="atom-select__item-label">
              {itemProps.item.rawValue.label}
            </Select.ItemLabel>
          </div>

          <Select.ItemIndicator class="atom-select__item-indicator">
            ✓
          </Select.ItemIndicator>
        </Select.Item>
      )}
    >
      <Select.HiddenSelect />
      {props.label ? (
        <Select.Label class="atom-select__label">{props.label}</Select.Label>
      ) : null}
      <Select.Trigger class="atom-select__trigger">
        <Select.Value<AtomSelectOption> class="atom-select__value">
          {(state) => state.selectedOption()?.label}
        </Select.Value>
        <Select.Icon class="atom-select__icon">▾</Select.Icon>
      </Select.Trigger>
      {props.description ? (
        <Select.Description class="atom-select__description">
          {props.description}
        </Select.Description>
      ) : null}
      {props.errorMessage ? (
        <Select.ErrorMessage class="atom-select__error-message">
          {props.errorMessage}
        </Select.ErrorMessage>
      ) : null}
      <Select.Portal>
        <Select.Content class="atom-select__content">
          <Select.Listbox class="atom-select__listbox" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
