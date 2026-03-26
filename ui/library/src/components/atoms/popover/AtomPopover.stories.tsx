import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomPopover from "@lib/components/atoms/popover/AtomPopover";
import type { AtomPopoverProps } from "@lib/components/atoms/popover/AtomPopover.types";

const meta = {
  title: "Atoms/AtomPopover",
  argTypes: {
    trigger: { control: false },
    content: { control: false },
  },
  render: (args: AtomPopoverProps) =>
    renderSolid(() => <AtomPopover {...args} />),
};

export default meta;

export const Basic = {
  args: {
    trigger: <span>Open popover</span>,
    content: (
      <div>
        <p>Profile</p>
        <p>Settings</p>
      </div>
    ),
  },
};
