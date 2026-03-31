import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { AtomCollapsibleProps } from "@lib/components/atoms/collapsible/AtomCollapsible.types";

const meta = {
  title: "Atoms/AtomCollapsible",
  argTypes: {
    trigger: { control: false },
    content: { control: false },
  },
  render: (args: AtomCollapsibleProps) =>
    renderSolid(() => <AtomCollapsible {...args} />),
};

export default meta;

export const Basic = {
  args: {
    trigger: <span>Shipping details</span>,
    content: (
      <div>
        <p>Orders are prepared within 24 hours.</p>
        <p>
          Delivery times vary depending on destination and courier capacity.
        </p>
      </div>
    ),
  },
};
