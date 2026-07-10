import AtomButton, { BUTTON_SIZES, BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, Index, Show } from "solid-js";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useI18n } from "@/stores/i18n/i18n";
import { canSeeClassification } from "@/utils/event";
import { getMarkerColorByStatus, getMarkerTextColorByStatus, isStageLive } from "@/utils/stage";
import { formatDateLabel, formatStageDateRange, toDateInputValue } from "@/utils/date";
import WrongLocationForm from "@/components/routes/stages/stages-map/WrongLocationForm";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import { useAuthUser } from "@/stores/auth/auth";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";

interface StageMapMarker {
  stage: StageSummaryResponseDTO;
  onEnroll?: (stageId: string, eventId: string) => void;
}

export function StageMapMarkerPopup(props: StageMapMarker) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const user = useAuthUser();
  const navigateToClassification = (eventId: string) =>
    void navigate({
      params: { id: props.stage.id, eventId },
      to: "/stages/$id/events/$eventId/classification",
    });

  const navigateToStageInfo = (stageId: string) =>
    void navigate({
      params: { id: stageId },
      to: "/stages/$id/info",
    });

  const [openWrongLocationForm, setOpenWrongLocationForm] = createSignal(false);
  return (
    <div class="stages-map-marker-popup">
      <span class="text-body-md">{props.stage.name}</span>
      <span class="text-caption-lg">{props.stage.competitionName}</span>
      <span class="text-caption-sm">
        {formatStageDateRange(
          props.stage.dateFrom ?? 0,
          props.stage.dateTo ?? 0,
        )}
      </span>

      <div class="divider" />

      <span class="text-body-sm">{i18n.t("STAGES.INFO.EVENTS")}</span>
      <Index each={props.stage.events ?? []}>
        {(event) => (
          <div class="stages-map-marker-popup__row">
            <div class="stages-map-marker-popup__row--title">
              <DisciplineIcon disciplineId={event().discipline.id} />
              <span class="text-heading-xs">{event().name}</span>
              <Show when={isStageLive(event().status)}>
                <StatusBadge status={event().status} dotMode />
              </Show>
            </div>
            <Show when={event().enrollmentOpened}>
              <Show
                when={user()}
                fallback={
                  <AtomButton
                    type={BUTTON_TYPES.GHOST}
                    size={BUTTON_SIZES.SM}
                    onClick={startGoogleInteractiveLogin}
                  >
                    {i18n.t("STAGES.INFO.LOGIN_TO_ENROLL")}
                  </AtomButton>
                }
              >
                <div class="stages-map-marker-popup__enrollment">
                  <AtomButton
                    size={BUTTON_SIZES.SM}
                    onClick={() => props.onEnroll?.(props.stage.id, event().id)}
                  >
                    {i18n.t("STAGES.INFO.ENROLL")}
                  </AtomButton>
                  <span class="text-caption-sm">
                    {i18n.t("STAGES.INFO.UNTIL")}{" "}
                    {formatDateLabel(
                      toDateInputValue(event().enrollmentDeadline ?? 0),
                    )}
                  </span>
                </div>
              </Show>
            </Show>
            <Show when={canSeeClassification(event().status)}>
              <AtomButton
                size={BUTTON_SIZES.SM}
                onClick={() => navigateToClassification(event().id)}
              >
                {i18n.t("STAGES.STAGES_MAP.MARKER.VIEW_CLASSIFICATIONS")}
              </AtomButton>
            </Show>
          </div>
        )}
      </Index>
      <div class="stages-map-marker-popup__actions">
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() => navigateToStageInfo(props.stage.id)}
          size={BUTTON_SIZES.SM}
        >
          {i18n.t("STAGES.STAGES_MAP.MARKER.INFO")}
        </AtomButton>
        <AtomDialog
          closeButtonText={i18n.t("STAGES.STAGES_MAP.MARKER.CLOSE_DIALOG")}
          content={
            <WrongLocationForm
              stageId={props.stage.id}
              onClose={() => setOpenWrongLocationForm(false)}
            />
          }
          onOpenChange={setOpenWrongLocationForm}
          open={openWrongLocationForm()}
          title={i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION")}
          trigger={
            <AtomButton size={BUTTON_SIZES.SM} type={BUTTON_TYPES.GHOST}>
              {i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION_QUESTION")}
            </AtomButton>
          }
        />
      </div>
    </div>
  );
}

export function StageMapMarker(props: StageMapMarker) {
  return (
    <div
      role="img"
      aria-label={props.stage.name}
      classList={{
        "stages-map-marker": true,
        "stages-map-marker--live": isStageLive(props.stage.status),
      }}
      style={{
        background: getMarkerColorByStatus(props.stage.status),
        color: getMarkerTextColorByStatus(props.stage.status),
      }}
    />
  );
}
