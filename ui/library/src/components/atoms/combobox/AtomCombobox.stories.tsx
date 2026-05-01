import { createSignal } from "solid-js";
import { renderSolid } from "@lib/../.storybook/renderSolid";
import { AtomCombobox } from "./AtomCombobox";
import type { AtomComboboxProps } from "./AtomCombobox";

const OPTIONS = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"];

const meta = {
  title: "Atoms/AtomCombobox",
  render: (args: AtomComboboxProps) => {
    const [value, setValue] = createSignal<string | null>(args.value ?? null);

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
    ariaLabel: "Favorite fruit",
    options: OPTIONS,
    placeholder: "Select a fruit",
  },
};

export const WithValue = {
  args: {
    ariaLabel: "Favorite fruit",
    options: OPTIONS,
    placeholder: "Select a fruit",
    value: "Blueberry",
  },
};
