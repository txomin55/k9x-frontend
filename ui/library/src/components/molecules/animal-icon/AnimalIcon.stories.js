import AnimalIcon from "./AnimalIcon.svelte";
import { availableAnimalNames } from "./animals.constants.js";

export default {
  title: "Molecules/AnimalIcon",
  component: AnimalIcon,
  argTypes: {
    animal: {
      options: Object.values(availableAnimalNames),
      control: { type: "select" },
    },
  },
};

export const Basic = {
  args: {
    animal: availableAnimalNames.DOG,
  },
};
