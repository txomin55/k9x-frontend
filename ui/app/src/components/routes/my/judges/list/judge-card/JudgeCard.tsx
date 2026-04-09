import Card from "@lib/components/molecules/card/Card";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import type { JudgeCardProps } from "@/components/routes/my/judges/list/judge-card/JudgeCard.types";
import "./styles.css";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";

export default function JudgeCard(props: JudgeCardProps) {
  return (
    <Card
      topLeft={
        <div class="judge-card__heading">
          <span class="judge-card__name">{props.judge.name}</span>
        </div>
      }
      description={<span class="text-body-md">{props.judge.id}</span>}
      actions={
        <div class="judge-card__actions">
          <ConfirmActionButton
            text={props.judge.name}
            onConfirm={props.onDelete}
          >
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>--Delete</AtomButton>
          </ConfirmActionButton>
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onEdit}>
            --Edit
          </AtomButton>
        </div>
      }
    />
  );
}
