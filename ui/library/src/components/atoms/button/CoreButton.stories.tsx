import { renderSolid } from "@lib/../.storybook/renderSolid";
import CoreButton, {
  type CoreButtonProps,
} from "@lib/components/atoms/button/CoreButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/button.constants";
import { fn } from "storybook/test";

const meta = {
  title: "Atoms/CoreButton",
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
    renderSolid(() => <CoreButton {...args}>this is a button</CoreButton>),
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
