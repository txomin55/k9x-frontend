import { Combobox } from "@kobalte/core/combobox";
import "./styles.css";

export type AtomComboboxProps = {
  options: string[];
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export function AtomCombobox(props: AtomComboboxProps) {
  return (
    <Combobox
      disabled={props.disabled}
      options={props.options}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      itemComponent={(itemProps) => (
        <Combobox.Item item={itemProps.item} class="atom-combobox__item">
          <Combobox.ItemLabel>{itemProps.item.rawValue}</Combobox.ItemLabel>
          <Combobox.ItemIndicator class="atom-combobox__item-indicator">
            x
          </Combobox.ItemIndicator>
        </Combobox.Item>
      )}
    >
      <Combobox.Control class="atom-combobox__control">
        <Combobox.Input class="atom-combobox__input" />
        <Combobox.Trigger>
          <Combobox.Icon class="atom-combobox__icon">^</Combobox.Icon>
        </Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="atom-combobox__content">
          <Combobox.Listbox class="atom-combobox__listbox" />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
