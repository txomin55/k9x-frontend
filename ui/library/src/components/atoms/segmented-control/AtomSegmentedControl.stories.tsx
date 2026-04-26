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

const CONTROLS_WITH_DISABLED = [
  {
    value: "grid",
    text: "Grid",
    content: <div>Grid content</div>,
  },
  {
    value: "list",
    text: "List",
    content: <div>List content</div>,
    disabled: true,
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
    control: "grid",
    controls: CONTROLS,
  },
};

export const WithDisabledOption = {
  args: {
    title: "View",
    control: "grid",
    controls: CONTROLS_WITH_DISABLED,
  },
};
