<script>
  import CoreSvgIcon from "../../atoms/svg-icon/CoreSvgIcon.svelte";
  import { availableAnimalNames } from "./animals.constants.js";

  export let animal = "";

  const basePath = import.meta.env.VITE_APP_BASE_PATH ?? "";
  const importedAnimals = import.meta.glob(
    "../../../assets/svg/animals/*.svg",
    { eager: true, import: "default" }
  );
  const animalSources = Object.fromEntries(
    Object.entries(importedAnimals).map(([path, src]) => {
      const name = path.split("/").pop().replace(".svg", "");
      return [name, src];
    })
  );

  $: curatedAnimal =
    availableAnimalNames[animal?.toUpperCase?.()] ?? availableAnimalNames.DOG;
  $: iconSrc =
    basePath !== ""
      ? `${basePath}/animals/${curatedAnimal}.svg`
      : animalSources[curatedAnimal];
</script>

<CoreSvgIcon src={iconSrc} alt={curatedAnimal} />
