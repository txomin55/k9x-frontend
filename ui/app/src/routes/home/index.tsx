import AnimalIcon from "@lib/components/molecules/animal-icon/AnimalIcon";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";

export default function HomeRoute() {
  return (
    <>
      <h1>Home</h1>
      <AnimalIcon animal={availableAnimalNames.CAT} />
    </>
  );
}
