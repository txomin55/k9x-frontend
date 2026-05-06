import { createSignal, JSX } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { useI18n } from "@/stores/i18n/i18n";
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
  const i18n = useI18n();

  const handleConfirm = () => {
    props.onConfirm();
    setIsOpen(false);
  };

  return (
    <AtomDialog
      title={props.title ?? i18n.t("COMMON.CONFIRM_ACTION_BUTTON.CONFIRM_DELETION")}
      content={
        <div class="confirm-action-button__content">
          <p>
            {i18n.t("COMMON.CONFIRM_ACTION_BUTTON.CONFIRM_REMOVE")}{" "}
            {props.text ?? i18n.t("COMMON.CONFIRM_ACTION_BUTTON.THIS_ITEM")}?
          </p>
          <div class="confirm-action-button__actions">
            <AtomButton
              type={BUTTON_TYPES.ACCENT}
              onClick={() => setIsOpen(false)}
            >
              {props.cancelText ?? i18n.t("COMMON.CONFIRM_ACTION_BUTTON.CANCEL")}
            </AtomButton>
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE} onClick={handleConfirm}>
              {props.confirmText ?? i18n.t("COMMON.CONFIRM_ACTION_BUTTON.DELETE")}
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
