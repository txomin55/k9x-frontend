import { Title } from "@solidjs/meta";
import AnimalIcon from "@lib/components/molecules/animal-icon/AnimalIcon";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";

export default function HomeRoute() {
  return (
    <>
      <Title>Home</Title>
      <AnimalIcon animal={availableAnimalNames.CAT} />
    </>
  );
}
