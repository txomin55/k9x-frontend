import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectProps } from "@lib/components/atoms/select/AtomSelect.types";

const OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Fox", value: "fox" },
  { label: "Whale", value: "whale", disabled: true },
];

const meta = {
  title: "Atoms/AtomSelect",
  render: (args: AtomSelectProps) => renderSolid(() => <AtomSelect {...args} />),
};

export default meta;

export const Basic = {
  args: {
    label: "Favorite animal",
    description: "Choose one option from the list.",
    placeholder: "Select an animal",
    options: OPTIONS,
  },
};

export const WithDefaultValue = {
  args: {
    label: "Favorite animal",
    options: OPTIONS,
    defaultValue: OPTIONS[1],
  },
};
