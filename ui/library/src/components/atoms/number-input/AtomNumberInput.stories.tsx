import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import type { AtomNumberInputProps } from "@lib/components/atoms/number-input/AtomNumberInput.types";

const meta = {
  title: "Atoms/AtomNumberInput",
  render: (args: AtomNumberInputProps) =>
    renderSolid(() => <AtomNumberInput {...args} />),
};

export default meta;

export const Basic = {
  args: {
    label: "Quantity",
    description: "Choose how many units you need.",
    defaultValue: 2,
    minValue: 0,
    step: 1,
  },
};

export const Invalid = {
  args: {
    label: "Quantity",
    defaultValue: 0,
    validationState: "invalid",
    errorMessage: "Quantity must be at least 1.",
  },
};
