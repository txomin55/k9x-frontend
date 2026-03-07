<script>
    import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon.svelte";
    import {availableAnimalNames} from "@lib/components/molecules/animal-icon/animals.constants.js";

    let { animal = "" } = $props();

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

    const curatedAnimal = $derived.by(
        () => availableAnimalNames[animal?.toUpperCase?.()] ?? availableAnimalNames.DOG,
    );

    const iconSrc = $derived.by(() => animalMap[curatedAnimal]);
</script>

<CoreSvgIcon src={iconSrc} alt={curatedAnimal}/>
