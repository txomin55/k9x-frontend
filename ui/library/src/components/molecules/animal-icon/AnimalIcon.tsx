import { createMemo } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import {
  type AnimalName,
  availableAnimalNames,
} from "@lib/components/molecules/animal-icon/animals.constants";

export type AnimalIconProps = {
  animal?: AnimalName | string;
};

export default function AnimalIcon(props: AnimalIconProps) {
  const basePath = (
    import.meta.env.VITE_APP_BASE_PATH ?? "/src/assets/svg/"
  ).replace(/\/$/, "");
  const resolveAnimalName = () =>
    props.animal?.toUpperCase?.() as
      | keyof typeof availableAnimalNames
      | undefined;
  const curatedAnimal = createMemo(() => {
    const animalName = resolveAnimalName();
    return animalName
      ? availableAnimalNames[animalName]
      : availableAnimalNames.DOG;
  });
  const iconSrc = createMemo(
    () => `${basePath}/animals/${curatedAnimal()}.svg`,
  );

  return <AtomSvgIcon src={iconSrc()} alt={curatedAnimal()} />;
}
