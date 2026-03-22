import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomImage, { type AtomImageProps } from "@lib/components/atoms/image/AtomImage";

const meta = {
  title: "Atoms/AtomImage",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
  render: (args: AtomImageProps) => renderSolid(() => <AtomImage {...args} />),
};

export default meta;

export const Basic = {
  args: {
    src: "https://placehold.co/96x96/png",
    alt: "core image",
    fallback: "CI",
  },
};
