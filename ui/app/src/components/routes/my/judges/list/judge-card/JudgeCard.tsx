import Card from "@lib/components/molecules/card/Card";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import type { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import "./styles.css";
import { useI18n } from "@/stores/i18n/i18n";

type JudgeCardProps = {
  judge: JudgeResponseDTO;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };

export default function JudgeCard(props: JudgeCardProps) {
  const i18n = useI18n();
  return (
    <Card
      topLeft={
        <div class="judge-card__heading">
          <CountryFlag country={props.judge.country} />
          <span class="judge-card__name">{props.judge.name}</span>
        </div>
      }
      actions={
        <div class="judge-card__actions">
          <ConfirmActionButton
            text={props.judge.name}
            onConfirm={props.onDelete}
          >
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
              {i18n.t("MY.JUDGES.JUDGE_CARD.DELETE")}
            </AtomButton>
          </ConfirmActionButton>
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onEdit}>
            {i18n.t("MY.JUDGES.JUDGE_CARD.EDIT")}
          </AtomButton>
        </div>
      }
    />
  );
}
