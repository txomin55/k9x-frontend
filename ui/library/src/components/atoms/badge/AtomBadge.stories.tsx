import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import type { AtomBadgeProps } from "@lib/components/atoms/badge/AtomBadge.types";

const meta = {
  title: "Atoms/AtomBadge",
  argTypes: {
    kind: {
      options: ["success", "warning", "error", "accent"],
      control: { type: "select" },
    },
    textValue: { control: "text" },
  },
  render: (args: AtomBadgeProps) =>
    renderSolid(() => <AtomBadge {...args}>{args.children}</AtomBadge>),
};

export default meta;

export const Basic = {
  args: {
    children: "Badge",
  },
};

export const Success = {
  args: {
    children: "Active",
    kind: "success",
  },
};

export const Warning = {
  args: {
    children: "Pending",
    kind: "warning",
  },
};

export const Error = {
  args: {
    children: "Blocked",
    kind: "error",
  },
};

export const Accent = {
  args: {
    children: "Featured",
    kind: "accent",
  },
};
