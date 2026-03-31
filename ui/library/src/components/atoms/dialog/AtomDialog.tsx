import * as Dialog from "@kobalte/core/dialog";
import type { AtomDialogProps } from "@lib/components/atoms/dialog/AtomDialog.types";
import "./AtomDialog.css";

export default function AtomDialog(props: AtomDialogProps) {
  return (
    <Dialog.Root
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      modal={props.modal}
    >
      <div class="atom-dialog">
        <Dialog.Trigger class="atom-dialog__trigger">
          {props.trigger}
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay class="atom-dialog__overlay" />
        <Dialog.Content class="atom-dialog__content">
          <div class="atom-dialog__header">
            {props.title ? (
              <Dialog.Title class="atom-dialog__title">{props.title}</Dialog.Title>
            ) : null}
            <Dialog.CloseButton
              class="atom-dialog__close-button"
              aria-label={props.closeButtonText ?? "Close dialog"}
            >
              {props.closeButtonText ?? "Close"}
            </Dialog.CloseButton>
          </div>
          {props.description ? (
            <Dialog.Description class="atom-dialog__description">
              {props.description}
            </Dialog.Description>
          ) : null}
          <div class="atom-dialog__body">{props.content}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
