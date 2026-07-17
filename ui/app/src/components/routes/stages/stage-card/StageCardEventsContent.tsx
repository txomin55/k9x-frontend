import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { Index, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import { canSeeClassification } from "@/utils/event";
import { formatDateLabel, toDateInputValue } from "@/utils/date";
import { useAuthUser } from "@/stores/auth/auth";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import type { StageEventSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import RankBadge from "@/components/common/rank-badge/RankBadge";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import scoresIcon from "@/assets/miscelaneous/scores.svg";
import userPlusIcon from "@/assets/miscelaneous/user-plus.svg";
import "./styles.css";

export interface StageCardEventsContentProps {
  id: string;
  events: StageEventSummaryResponseDTO[];
  onEnroll?: (eventId: string) => void;
}

export default function StageCardEventsContent(
  props: StageCardEventsContentProps,
) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const user = useAuthUser();
  const navigateToClassification = (eventId: string) =>
    void navigate({
      params: { id: props.id, eventId },
      to: "/stages/$id/events/$eventId/classification",
    });

  return (
    <Index each={props.events}>
      {(event) => (
        <div class="stage-card__events-content">
          <div class="stage-card__events-content--info">
            <RankBadge rank={event().rank} />
            <DisciplineIcon disciplineId={event().discipline.id} />
            <span class="text-heading-xs">{event().name}</span>
            <span class="text-caption-sm">({event().competitors})</span>
            <AwardBadges awards={event().awards} />
          </div>
          <div class="stage-card__events-actions">
            <Show when={event().enrollmentOpened}>
              <Show
                when={user()}
                fallback={
                  <AtomButton
                    type={BUTTON_TYPES.GHOST}
                    onClick={startGoogleInteractiveLogin}
                  >
                    {i18n.t("STAGES.INFO.LOGIN_TO_ENROLL")}
                  </AtomButton>
                }
              >
                <div class="stage-card__events-content--enrollment">
                  <AtomButton onClick={() => props.onEnroll?.(event().id)}>
                    <span class="stage-card__events-btn-icon">
                      <AtomSvgIcon src={userPlusIcon} alt="" tinted />
                    </span>
                    <span class="stage-card__events-btn-label">
                      {i18n.t("STAGES.INFO.ENROLL")}
                    </span>
                  </AtomButton>
                  <span class="text-caption-sm">
                    {formatDateLabel(
                      toDateInputValue(event().enrollmentDeadline ?? 0),
                    )}
                  </span>
                </div>
              </Show>
            </Show>
            <Show when={canSeeClassification(event().status)}>
              <AtomButton
                type={BUTTON_TYPES.PRIMARY}
                onClick={() => navigateToClassification(event().id)}
              >
                <span class="stage-card__events-btn-icon">
                  <AtomSvgIcon src={scoresIcon} alt="" tinted />
                </span>
                <span class="stage-card__events-btn-label">
                  {i18n.t("STAGES.STAGE_CARD.SEE_CLASSIFICATION")}
                </span>
              </AtomButton>
            </Show>
          </div>
        </div>
      )}
    </Index>
  );
}
