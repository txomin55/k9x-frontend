import AnimalIcon from "@lib/components/molecules/animal-icon/AnimalIcon";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";

export default function MyCompetitionsRoute() {
  return (
    <>
      <h1>--My competitions</h1>
      <AnimalIcon animal={availableAnimalNames.CAT} />
    </>
  );
}
