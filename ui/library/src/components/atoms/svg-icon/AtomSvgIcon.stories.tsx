import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { CoreSvgIconProps } from "@lib/components/atoms/svg-icon/AtomSvgIcon.types";

const sampleIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23888'/%3E%3C/svg%3E";

const meta = {
  title: "Atoms/AtomSvgIcon",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
  render: (args: CoreSvgIconProps) =>
    renderSolid(() => <AtomSvgIcon {...args} />),
};

export default meta;

export const Basic = {
  args: {
    src: sampleIcon,
    alt: "icon",
  },
};
