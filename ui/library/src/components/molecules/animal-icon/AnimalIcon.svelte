<script>
    import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon.svelte";
    import {availableAnimalNames} from "@lib/components/molecules/animal-icon/animals.constants.js";

    export let animal = "";

    $: curatedAnimal =
        availableAnimalNames[animal?.toUpperCase?.()] ?? availableAnimalNames.DOG;

    const animalSvgs = import.meta.glob("/src/assets/svg/animals/*.svg", {
        eager: true,
        import: "default",
    });

    $: iconSrc = import.meta.env.VITE_APP_BASE_PATH
        ? `${import.meta.env.VITE_APP_BASE_PATH}/animals/${curatedAnimal}.svg`
        : animalSvgs[`/src/assets/svg/animals/${curatedAnimal}.svg`];
</script>

<CoreSvgIcon src={iconSrc} alt={curatedAnimal}/>
