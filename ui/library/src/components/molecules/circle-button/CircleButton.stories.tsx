import { renderSolid } from "@lib/../.storybook/renderSolid";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import type { CircleButtonProps } from "@lib/components/molecules/circle-button/CircleButton.types";
import { fn } from "storybook/test";

const meta = {
  title: "Molecules/CircleButton",
  tags: ["new"],
  argTypes: {
    children: { control: "text" },
    disabled: { control: "boolean" },
    onClick: { control: "function" },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  render: (args: CircleButtonProps) =>
    renderSolid(() => (
      <CircleButton disabled={args.disabled} onClick={args.onClick} size={args.size}>
        {args.children}
      </CircleButton>
    )),
};

export default meta;

export const Basic = {
  args: {
    children: "+",
    disabled: false,
    onClick: fn(),
    size: "md",
  },
};
