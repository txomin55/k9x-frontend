import * as Collapsible from "@kobalte/core/collapsible";
import type { AtomCollapsibleProps } from "@lib/components/atoms/collapsible/AtomCollapsible.types";
import "./styles.css";

export default function AtomCollapsible(props: AtomCollapsibleProps) {
  return (
    <Collapsible.Root
      class="atom-collapsible"
      disabled={props.disabled}
      onOpenChange={props.onOpenChange}
      open={props.open}
    >
      <Collapsible.Trigger class="atom-collapsible__trigger">
        <span class="atom-collapsible__trigger-label">{props.trigger}</span>
        <span class="atom-collapsible__indicator">+</span>
      </Collapsible.Trigger>
      <Collapsible.Content class="atom-collapsible__content">
        <div class="atom-collapsible__content-inner">{props.content}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
