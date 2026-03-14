import { renderSolid } from "../../../../.storybook/renderSolid";
import AnimalIcon, {
  type AnimalIconProps,
} from "@lib/components/molecules/animal-icon/AnimalIcon";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";

const meta = {
  title: "Molecules/AnimalIcon",
  argTypes: {
    animal: {
      options: Object.values(availableAnimalNames),
      control: { type: "select" },
    },
  },
  render: (args: AnimalIconProps) => renderSolid(() => <AnimalIcon {...args} />),
};

export default meta;

export const Basic = {
  args: {
    animal: availableAnimalNames.DOG,
  },
};
