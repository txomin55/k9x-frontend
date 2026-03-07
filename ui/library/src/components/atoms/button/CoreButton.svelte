<script>
  import "@lib/components/atoms/button/styles.css";
  import {BUTTON_TYPES} from "@lib/components/atoms/button/button.constants.js";

  let {
        label = "", type = BUTTON_TYPES.DEFAULT, disabled = false, onClick = () => {
        }
    } = $props();

    const clickEvent = (event) => {
        if (!disabled) {
            onClick(event);
        }
    };

    const disabledClass = $derived.by(() => (disabled ? "disabled" : ""));
    const typeClass = $derived.by(() => type ?? BUTTON_TYPES.DEFAULT);
</script>

<button
        class={`button ${typeClass} ${disabledClass}`}
        onclick={clickEvent}
        disabled={disabled}
>
    {label}
</button>
