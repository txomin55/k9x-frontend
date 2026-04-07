import { createSignal, JSX } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import "./styles.css";

type ConfirmActionButtonProps = {
  children: JSX.Element;
  onConfirm: () => void;
  title?: JSX.Element | string;
  text?: JSX.Element | string;
  confirmText?: JSX.Element | string;
  cancelText?: JSX.Element | string;
};

export default function ConfirmActionButton(props: ConfirmActionButtonProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleConfirm = () => {
    props.onConfirm();
    setIsOpen(false);
  };

  return (
    <AtomDialog
      title={props.title ?? "--Confirm deletion"}
      content={
        <div class="confirm-action-button__content">
          <p>
            --Are you sure you want to remove {props.text ?? "--this item"}?
          </p>
          <div class="confirm-action-button__actions">
            <AtomButton type="accent" onClick={() => setIsOpen(false)}>
              {props.cancelText ?? "--Cancel"}
            </AtomButton>
            <AtomButton type="destructive" onClick={handleConfirm}>
              {props.confirmText ?? "--Delete"}
            </AtomButton>
          </div>
        </div>
      }
      open={isOpen()}
      onOpenChange={setIsOpen}
      trigger={props.children}
    />
  );
}
