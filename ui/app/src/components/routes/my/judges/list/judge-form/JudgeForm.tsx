import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type JudgeFormProps = {
  draft: () => IdNameDTO;
  onDraftChange: (
    updater: (current: IdNameDTO) => IdNameDTO,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeForm(props: JudgeFormProps) {
  const i18n = useI18n();
  const updateField = (field: keyof IdNameDTO) => (value: string) => {
    props.onDraftChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div class="judge-form">
      <AtomInput
        label={i18n.t("MY.JUDGES.JUDGE_FORM.NAME")}
        value={props.draft().name ?? ""}
        onChange={updateField("name")}
      />
      <div class="judge-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.JUDGES.JUDGE_FORM.CANCEL")}
        </AtomButton>
        <AtomButton onClick={props.onSave}>{i18n.t("MY.JUDGES.JUDGE_FORM.SAVE")}</AtomButton>
      </div>
    </div>
  );
}
