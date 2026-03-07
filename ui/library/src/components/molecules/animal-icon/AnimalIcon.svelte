<script>
    import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon.svelte";
    import {availableAnimalNames} from "@lib/components/molecules/animal-icon/animals.constants.js";

    export let animal = "";

    const animalSources = import.meta.glob(
        "@lib/assets/svg/animals/*.svg",
        {eager: true, import: "default"},
    );
    const animalMap = Object.fromEntries(
        Object.entries(animalSources).map(([path, src]) => {
            const name = path.split("/").pop().replace(".svg", "");
            return [name, src];
        }),
    );

    $: curatedAnimal =
        availableAnimalNames[animal?.toUpperCase?.()] ?? availableAnimalNames.DOG;

    $: iconSrc = animalMap[curatedAnimal];
</script>

<CoreSvgIcon src={iconSrc} alt={curatedAnimal}/>
