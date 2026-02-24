import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon.jsx";
import { availableAnimalNames } from "./animals.constants.js";

const AnimalIcon = (props) => {
  const curatedAnimal =
    availableAnimalNames[props.animal.toUpperCase()] ??
    availableAnimalNames.DOG;

  return (
    <CoreSvgIcon
      src={`${process.env.VITE_APP_BASE_PATH}/animals/${curatedAnimal}.svg`}
    />
  );
};

export default AnimalIcon;
export const ANIMALS = availableAnimalNames;
