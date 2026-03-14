import { createMemo } from "solid-js";
import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon";
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
  const curatedAnimal = createMemo(
    () =>
      availableAnimalNames[props.animal?.toUpperCase?.()] ??
      availableAnimalNames.DOG,
  );
  const iconSrc = createMemo(
    () => `${basePath}/animals/${curatedAnimal()}.svg`,
  );

  return <CoreSvgIcon src={iconSrc()} alt={curatedAnimal()} />;
}
