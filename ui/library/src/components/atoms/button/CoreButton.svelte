<script>
  import "./styles.css";
  import { BUTTON_TYPES } from "./button.constants.js";

  export let label = "";
  export let type = BUTTON_TYPES.DEFAULT;
  export let disabled = false;
  export let onClick = () => {};

  const clickEvent = (event) => {
    if (!disabled) {
      onClick(event);
    }
  };

  $: disabledClass = disabled ? "disabled" : "";
  $: typeClass = type ?? BUTTON_TYPES.DEFAULT;
</script>

<button
  class={`button ${typeClass} ${disabledClass}`}
  on:click={clickEvent}
  disabled={disabled}
>
  {label}
</button>
