import * as Collapsible from "@kobalte/core/collapsible";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomCollapsibleSize = "md" | "sm";

export type AtomCollapsibleProps = {
  trigger: JSX.Element;
  content: JSX.Element;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** `sm` trims the vertical padding of trigger and content, for tight layouts. Defaults to `md`. */
  size?: AtomCollapsibleSize;
};

export default function AtomCollapsible(props: AtomCollapsibleProps) {
  return (
    <Collapsible.Root
      class={`atom-collapsible${props.size === "sm" ? " atom-collapsible--sm" : ""}`}
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
