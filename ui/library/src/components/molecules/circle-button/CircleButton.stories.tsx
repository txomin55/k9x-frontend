import { renderSolid } from "@lib/../.storybook/renderSolid";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import type { CircleButtonProps } from "@lib/components/molecules/circle-button/CircleButton.types";
import { fn } from "storybook/test";

const meta = {
  title: "Molecules/CircleButton",
  tags: ["new"],
  argTypes: {
    onClick: { control: "function" },
    children: { control: "text" },
  },
  render: (args: CircleButtonProps) =>
    renderSolid(() => <CircleButton onClick={args.onClick}>{args.children}</CircleButton>),
};

export default meta;

export const Basic = {
  args: {
    children: "+",
    onClick: fn(),
  },
};
