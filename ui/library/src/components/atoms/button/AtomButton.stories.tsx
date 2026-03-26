import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import type { CoreButtonProps } from "@lib/components/atoms/button/AtomButton.types";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import { fn } from "storybook/test";

const meta = {
  title: "Atoms/AtomButton",
  tags: ["new"],
  argTypes: {
    type: {
      options: Object.values(BUTTON_TYPES),
      mapping: BUTTON_TYPES,
      control: { type: "select" },
    },
    onClick: { control: "function" },
    disabled: { control: "boolean" },
  },
  actions: {
    args: {
      onClick: fn(),
    },
  },
  parameters: {
    design: {
      type: "figspec",
      url: "https://www.figma.com/file/twFjIpOW0mzopH3yKEWJnm/Chromatic-library-test?node-id=61-56&t=QdsTnU2HBcqMTuT9-0",
    },
  },
  render: (args: CoreButtonProps) =>
    renderSolid(() => <AtomButton {...args}>this is a button</AtomButton>),
};

export default meta;

export const Basic = {
  args: {
    onClick: fn(() => {
      alert("button clicked");
    }),
    disabled: false,
    type: BUTTON_TYPES.PRIMARY,
  },
  //tags: ["experimental"],
};

export const Basic2 = {
  tags: ["outdated"],
  args: {
    onClick: fn(() => {
      alert("button clicked");
    }),
    disabled: false,
    type: BUTTON_TYPES.PRIMARY,
  },
  //tags: ["experimental"],
};
