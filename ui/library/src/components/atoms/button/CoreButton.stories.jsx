import CoreButton, { BUTTON_TYPES } from "./CoreButton";
import { fn } from "storybook/test";

export default {
  title: "Atoms/CoreButton",
  tags: ["figma:v1"],
  argTypes: {
    label: {
      control: "text",
    },
    type: {
      options: Object.values(BUTTON_TYPES),
      mapping: BUTTON_TYPES,
      control: {
        type: "select",
      },
    },
    onClick: {
      control: "function",
    },
    disabled: {
      control: "boolean",
    },
  },
  actions: {
    args: {
      onClick: fn(),
    },
  },
  parameters: {
    design: {
      type: "figspec",
      url: "https://www.figma.com/file/twFjIpOW0mzopH3yKEWJnm/Chromatic-library-test?node-id=61-56&t=QdsTnU2HBcqMTuT9-0", //hay que cambiar design por file en la url
    },
  },
};

const Template = (args) => <CoreButton {...args} />;

export const Basic = {
  render: Template,
  args: {
    label: "this is a button",
    onClick: fn(() => {
      alert("button clicked");
    }),
    disabled: false,
    type: BUTTON_TYPES.DEFAULT,
  },
};

export const Custom = {
  render: Template,
  args: {
    label: "this is a primary",
    onClick: fn(() => {
      alert("button clicked");
    }),
    disabled: false,
    type: BUTTON_TYPES.PRIMARY,
  },

  tags: ["figma:v1", "new"],
};
