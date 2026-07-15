import * as Collapsible from "@kobalte/core/collapsible";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomCollapsibleProps = {
  trigger: JSX.Element;
  content: JSX.Element;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

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
