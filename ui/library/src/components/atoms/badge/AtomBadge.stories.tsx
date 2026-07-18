import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import type { AtomBadgeProps } from "@lib/components/atoms/badge/AtomBadge";

const meta = {
  title: "Atoms/AtomBadge",
  argTypes: {
    type: {
      options: ["success", "warning", "error", "accent", "primary", "special"],
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
    type: "success",
  },
};

export const Warning = {
  args: {
    children: "Pending",
    type: "warning",
  },
};

export const Error = {
  args: {
    children: "Blocked",
    type: "error",
  },
};

export const Accent = {
  args: {
    children: "Featured",
    type: "accent",
  },
};

export const Special = {
  args: {
    children: "Special",
    type: "special",
  },
};

export const ColorByLabel = {
  render: () =>
    renderSolid(() => (
      <div style={{ display: "flex", gap: "4px", "flex-wrap": "wrap" }}>
        {["1", "2", "1", "3", "2"].map((tag) => (
          <AtomBadge textValue={tag} colorByLabel>
            {tag}
          </AtomBadge>
        ))}
      </div>
    )),
};
