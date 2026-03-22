import { renderSolid } from "@lib/../.storybook/renderSolid";
import CoreImage, {
  type CoreImageProps,
} from "@lib/components/atoms/image/AtomImage";

const meta = {
  title: "Atoms/CoreImage",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
  render: (args: CoreImageProps) => renderSolid(() => <CoreImage {...args} />),
};

export default meta;

export const Basic = {
  args: {
    src: "https://placehold.co/96x96/png",
    alt: "core image",
    fallback: "CI",
  },
};
