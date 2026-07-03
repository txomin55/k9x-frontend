import { createSignal } from "solid-js";
import { renderSolid } from "@lib/../.storybook/renderSolid";
import type { AtomComboboxOption } from "./AtomCombobox";
import { AtomCombobox } from "./AtomCombobox";

type StoryArgs = {
  label?: string;
  description?: string;
  errorMessage?: string;
  options: AtomComboboxOption[];
  placeholder?: string;
  validationState?: "valid" | "invalid";
  multiple?: boolean;
  value?: AtomComboboxOption | AtomComboboxOption[] | null;
  onChange?: (value: any) => void;
};

const OPTIONS: AtomComboboxOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
  ...Array.from({ length: 250 }, (_, index) => {
    const itemNumber = index + 1;

    return {
      label: `Fruit option ${itemNumber}`,
      value: `fruit-option-${itemNumber}`,
    };
  }),
];

const meta = {
  title: "Atoms/AtomCombobox",
  render: (args: StoryArgs) => {
    const [value, setValue] = createSignal(
      (args.value as AtomComboboxOption | null) ?? null,
    );

    return renderSolid(() => (
      <AtomCombobox
        {...(args as any)}
        onChange={(nextValue: AtomComboboxOption | null) => {
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

export const Multiple = {
  render: (args: StoryArgs) => {
    const [value, setValue] = createSignal<AtomComboboxOption[]>(
      (args.value as AtomComboboxOption[]) ?? [],
    );

    return renderSolid(() => (
      <AtomCombobox
        {...(args as any)}
        multiple
        onChange={(nextValue: AtomComboboxOption[]) => {
          setValue(nextValue);
          args.onChange?.(nextValue);
        }}
        value={value()}
      />
    ));
  },
  args: {
    label: "Favorite fruits",
    description: "Pick multiple fruits from the list.",
    options: OPTIONS,
    placeholder: "Select fruits",
    multiple: true,
    value: [OPTIONS[0], OPTIONS[2]],
  },
};
