import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomTabs from "@lib/components/atoms/tab/AtomTabs";
import type { TabsProps } from "@lib/components/atoms/tab/AtomTabs.types";

const TAB_OPTIONS = [
  { value: "dogs", content: <span>Dogs</span> },
  { value: "cats", content: <span>Cats</span> },
];

const TAB_CONTENTS = [
  {
    value: "dogs",
    content: (
      <div>
        <p>Dogs are loyal companions.</p>
      </div>
    ),
  },
  {
    value: "cats",
    content: (
      <div>
        <p>Cats are curious by nature.</p>
      </div>
    ),
  },
];

const meta = {
  title: "Atoms/AtomTabs",
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    value: { control: "text" },
    options: { control: false },
    contents: { control: false },
  },
  render: (args: TabsProps) => renderSolid(() => <AtomTabs {...args} />),
};

export default meta;

export const Basic = {
  args: {
    value: "dogs",
    options: TAB_OPTIONS,
    contents: TAB_CONTENTS,
  },
};
