import { createSignal } from "solid-js";
import { renderSolid } from "@lib/../.storybook/renderSolid";
import type { AtomComboboxOption, AtomComboboxProps } from "./AtomCombobox";
import { AtomCombobox } from "./AtomCombobox";

const OPTIONS: AtomComboboxOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
];

const meta = {
  title: "Atoms/AtomCombobox",
  render: (args: AtomComboboxProps) => {
    const [value, setValue] = createSignal(args.value ?? null);

    return renderSolid(() => (
      <AtomCombobox
        {...args}
        onChange={(nextValue) => {
          setValue(nextValue);
          args.onChange?.(nextValue);
        }}
        value={value()}
      />
    ));
  },
};

export default meta;

export const Basic = {
  args: {
    label: "Favorite fruit",
    description: "Pick one fruit from the list.",
    options: OPTIONS,
    placeholder: "Select a fruit",
  },
};

export const WithValue = {
  args: {
    label: "Favorite fruit",
    options: OPTIONS,
    placeholder: "Select a fruit",
    value: OPTIONS[2],
  },
};

export const WithError = {
  args: {
    errorMessage: "Please choose a fruit.",
    label: "Favorite fruit",
    options: OPTIONS,
    placeholder: "Select a fruit",
    validationState: "invalid",
  },
};

export const ErrorMessage = {
  args: {
    errorMessage: "This field is required.",
    label: "Favorite fruit",
    options: OPTIONS,
    placeholder: "Select a fruit",
    validationState: "invalid",
  },
};
