import { renderSolid } from "@lib/../.storybook/renderSolid";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";

const meta = {
  title: "Atoms/AtomSegmentedControl",
  render: () => renderSolid(() => <AtomSegmentedControl />),
};

export default meta;

export const Basic = {};
