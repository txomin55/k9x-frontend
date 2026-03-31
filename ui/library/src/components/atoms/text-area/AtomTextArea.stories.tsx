import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import type { AtomTextAreaProps } from "@lib/components/atoms/text-area/AtomTextArea.types";

const meta = {
  title: "Atoms/AtomTextArea",
  render: (args: AtomTextAreaProps) =>
    renderSolid(() => <AtomTextArea {...args} />),
};

export default meta;

export const Basic = {
  args: {
    label: "Notes",
    description: "Add any relevant context for the team.",
    placeholder: "Write your message...",
  },
};

export const WithDefaultValue = {
  args: {
    label: "Notes",
    defaultValue: "Initial multiline content.",
    autoResize: true,
  },
};
