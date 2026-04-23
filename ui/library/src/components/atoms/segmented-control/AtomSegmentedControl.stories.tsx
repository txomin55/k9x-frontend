import { renderSolid } from "@lib/../.storybook/renderSolid";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";

const CONTROLS = [
  {
    value: "grid",
    text: "Grid",
    content: <div>Grid content</div>,
  },
  {
    value: "list",
    text: "List",
    content: <div>List content</div>,
  },
  {
    value: "board",
    text: "Board",
    content: <div>Board content</div>,
  },
];

const meta = {
  title: "Atoms/AtomSegmentedControl",
  render: (args: Parameters<typeof AtomSegmentedControl>[0]) =>
    renderSolid(() => <AtomSegmentedControl {...args} />),
};

export default meta;

export const Basic = {
  args: {
    title: "View",
    defaultValue: "grid",
    controls: CONTROLS,
  },
};
