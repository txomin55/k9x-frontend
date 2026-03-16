import { renderSolid } from "@lib/../.storybook/renderSolid";
import CoreSvgIcon, {
  type CoreSvgIconProps,
} from "@lib/components/atoms/svg-icon/CoreSvgIcon";
import dog from "@lib/assets/svg/animals/dog.svg";

const meta = {
  title: "Atoms/CoreSvgIcon",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
  render: (args: CoreSvgIconProps) =>
    renderSolid(() => <CoreSvgIcon {...args} />),
};

export default meta;

export const Basic = {
  args: {
    src: dog,
    alt: "dog",
  },
};
