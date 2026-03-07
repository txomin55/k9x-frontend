import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon.svelte";
import dog from "@lib/assets/svg/animals/dog.svg";

export default {
  title: "Atoms/CoreSvgIcon",
  component: CoreSvgIcon,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
};

export const Basic = {
  args: {
    src: dog,
    alt: "dog",
  },
};
