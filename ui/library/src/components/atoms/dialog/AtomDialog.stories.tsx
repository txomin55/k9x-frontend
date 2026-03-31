import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import type { AtomDialogProps } from "@lib/components/atoms/dialog/AtomDialog.types";

const meta = {
  title: "Atoms/AtomDialog",
  argTypes: {
    trigger: { control: false },
    title: { control: false },
    description: { control: false },
    content: { control: false },
  },
  render: (args: AtomDialogProps) => renderSolid(() => <AtomDialog {...args} />),
};

export default meta;

export const Basic = {
  args: {
    trigger: <span>Open dialog</span>,
    title: "Dialog title",
    description: "A short explanation that provides context for the dialog.",
    content: (
      <div>
        <p>Dialog content goes here.</p>
      </div>
    ),
  },
};
