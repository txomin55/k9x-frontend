import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { CoreSvgIconProps } from "@lib/components/atoms/svg-icon/AtomSvgIcon.types";
import dog from "@lib/assets/svg/animals/dog.svg";

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
    src: dog,
    alt: "dog",
  },
};
