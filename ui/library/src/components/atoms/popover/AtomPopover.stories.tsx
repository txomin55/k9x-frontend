import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomPopover, {
  type AtomPopoverProps,
} from "@lib/components/atoms/popover/AtomPopover";

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
