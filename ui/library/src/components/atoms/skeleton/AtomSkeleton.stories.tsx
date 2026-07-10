import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomSkeleton, {
  type AtomSkeletonProps,
} from "@lib/components/atoms/skeleton/AtomSkeleton";

const meta = {
  title: "Atoms/AtomSkeleton",
  argTypes: {
    variant: {
      options: ["text", "circular", "rectangular"],
      control: { type: "select" },
    },
    width: { control: "text" },
    height: { control: "text" },
    count: { control: "number" },
    animated: { control: "boolean" },
  },
  render: (args: AtomSkeletonProps) => renderSolid(() => <AtomSkeleton {...args} />),
};

export default meta;

export const Text = {
  args: {
    width: "200px",
  },
};

export const Paragraph = {
  args: {
    count: 3,
  },
};

export const Circular = {
  args: {
    variant: "circular",
  },
};

export const Rectangular = {
  args: {
    variant: "rectangular",
    height: "120px",
  },
};

export const Card = {
  render: () =>
    renderSolid(() => (
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
          width: "260px",
          padding: "16px",
          border: "1px solid var(--border)",
          "border-radius": "12px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <AtomSkeleton variant="circular" width="40px" height="40px" />
          <div style={{ flex: 1 }}>
            <AtomSkeleton width="60%" />
            <AtomSkeleton width="40%" />
          </div>
        </div>
        <AtomSkeleton variant="rectangular" height="80px" />
        <AtomSkeleton count={2} />
      </div>
    )),
};
