import CoreSvgIcon from "./CoreSvgIcon.svelte";
import dog from "../../../assets/svg/animals/dog.svg";

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
