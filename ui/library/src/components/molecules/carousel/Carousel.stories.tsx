import { renderSolid } from "@lib/../.storybook/renderSolid";
import Carousel, {
  type CarouselProps,
} from "@lib/components/molecules/carousel/Carousel";
import Card from "@lib/components/molecules/card/Card";
import { fn } from "storybook/test";

const meta = {
  title: "Molecules/Carousel",
  tags: ["new"],
  argTypes: {
    initialIndex: { control: "number" },
    onChange: { control: "function" },
  },
  render: (args: Omit<CarouselProps, "items">) =>
    renderSolid(() => (
      <Carousel
        initialIndex={args.initialIndex}
        onChange={args.onChange}
        items={[
          <Card topLeft="Slide 1" description="First content" />,
          <Card topLeft="Slide 2" description="Second content" />,
          <Card topLeft="Slide 3" description="Third content" />,
        ]}
      />
    )),
};

export default meta;

export const Basic = {
  args: {
    initialIndex: 0,
    onChange: fn(),
  },
};
