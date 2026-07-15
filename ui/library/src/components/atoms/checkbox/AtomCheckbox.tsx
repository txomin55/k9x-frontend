import { Checkbox } from "@kobalte/core/checkbox";
import "./styles.css";

export interface AtomCheckboxProps {
  checked: boolean;
  setChecked?: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}

export default function AtomCheckbox(props: AtomCheckboxProps) {
  return (
    <Checkbox
      class="atom-checkbox"
      checked={props.checked}
      onChange={props.setChecked}
      disabled={props.disabled}
    >
      <Checkbox.Input class="atom-checkbox__input" />
      <Checkbox.Control class="atom-checkbox__control">
        <Checkbox.Indicator>X</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label class="atom-checkbox__label">
        {props.label}
      </Checkbox.Label>
    </Checkbox>
  );
}
