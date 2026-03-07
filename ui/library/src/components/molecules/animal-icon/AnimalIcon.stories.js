import AnimalIcon from "@lib/components/molecules/animal-icon/AnimalIcon.svelte";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants.js";

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
