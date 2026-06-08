import { Show } from "solid-js";
import { useToast } from "@/stores/toast/toast";
import "./styles.css";

export default function Toast() {
  const message = useToast();

  return (
    <Show when={message()}>
      <div class="toast" role="status" aria-live="polite">
        {message()}
      </div>
    </Show>
  );
}
