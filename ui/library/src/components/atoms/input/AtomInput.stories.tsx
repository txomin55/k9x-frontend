import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import type { AtomInputProps } from "@lib/components/atoms/input/AtomInput.types";

const meta = {
  title: "Atoms/AtomInput",
  render: (args: AtomInputProps) => renderSolid(() => <AtomInput {...args} />),
};

export default meta;

export const Basic = {
  args: {
    label: "Email",
    description: "We will use this address for notifications.",
    placeholder: "name@example.com",
    type: "email",
  },
};

export const WithDefaultValue = {
  args: {
    label: "Display name",
    defaultValue: "Txomin",
  },
};
