import * as Dialog from "@kobalte/core/dialog";
import { Show } from "solid-js";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomDialogProps = {
  trigger?: JSX.Element;
  triggerClass?: string;
  title?: JSX.Element;
  description?: JSX.Element;
  content: JSX.Element;
  closeButtonText?: string;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  size?: "md" | "wide";
};

export default function AtomDialog(props: AtomDialogProps) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange} modal>
      <Show when={props.trigger}>
        <div class="atom-dialog">
          <Dialog.Trigger
            class={`atom-dialog__trigger${props.triggerClass ? ` ${props.triggerClass}` : ""}`}
          >
            {props.trigger}
          </Dialog.Trigger>
        </div>
      </Show>
      <Dialog.Portal>
        <Dialog.Overlay class="atom-dialog__overlay" />
        <Dialog.Content
          class={`atom-dialog__content${props.size === "wide" ? " atom-dialog__content--wide" : ""}`}
        >
          <div class="atom-dialog__header">
            <Show when={props.title}>
              <Dialog.Title class="atom-dialog__title">
                {props.title}
              </Dialog.Title>
            </Show>
            <Dialog.CloseButton class="atom-dialog__close-button">
              x
            </Dialog.CloseButton>
          </div>
          <Show when={props.description}>
            <Dialog.Description class="atom-dialog__description">
              {props.description}
            </Dialog.Description>
          </Show>
          <div class="atom-dialog__body">{props.content}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
