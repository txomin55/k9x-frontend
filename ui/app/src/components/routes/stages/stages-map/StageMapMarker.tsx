import { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { createSignal, Index } from "solid-js";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import WrongLocationForm from "@/components/routes/stages/stages-map/WrongLocationForm";
import { useI18n } from "@/stores/i18n/i18n";

interface StageMapMarker {
  stage: StageSummaryResponseDTO;
}

const STAGE_STATUS = {
  PENDING: "pending",
  STARTED: "started",
  COMPLETED: "completed",
};

export function StageMapMarkerPopup(props: StageMapMarker) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const getDisciplineLabel = (discipline?: string | { name?: string }) =>
    typeof discipline === "string" ? discipline : (discipline?.name ?? "");
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
      <span class="stages-map-marker-popup__title">
        <span class="text-body-md">{props.stage.name}</span>
        <span class="text-caption-sm">
          {props.stage.dateFrom ?? ""}-{props.stage.dateTo ?? ""}
        </span>
      </span>
      <span class="text-body-sm">{props.stage.description}</span>
      <AtomDialog
        closeButtonText={i18n.t("STAGES.STAGES_MAP.MARKER.CLOSE_DIALOG")}
        content={<WrongLocationForm stageId={props.stage.id} />}
        onOpenChange={setOpenWrongLocationForm}
        open={openWrongLocationForm()}
        title={i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION")}
        trigger={
          <AtomButton type={BUTTON_TYPES.GHOST}>
            {i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION_QUESTION")}
          </AtomButton>
        }
      />
      <AtomButton
        type={BUTTON_TYPES.ACCENT}
        onClick={() => navigateToStageInfo(props.stage.id)}
      >
        {i18n.t("STAGES.STAGES_MAP.MARKER.INFO")}
      </AtomButton>

      <Index each={props.stage.events ?? []}>
        {(event) => (
          <div class="stages-map-marker-popup__row">
            <div class="stages-map-marker-popup__row--title">
              <span class="text-caption-sm">{event().status}</span>
              <span class="text-caption-sm">
                {event().name} {getDisciplineLabel(event().discipline)}
              </span>
            </div>
            <AtomButton
              onClick={() => navigateToClassification(event().id)}
            >
              {i18n.t("STAGES.STAGES_MAP.MARKER.VIEW_QUALIFICATIONS")}
            </AtomButton>
          </div>
        )}
      </Index>
    </div>
  );
}

export function StageMapMarker(props: StageMapMarker) {
  const getMarkerColorByStatus = (status: string) => {
    switch (status) {
      case STAGE_STATUS.PENDING:
        return "var(-warning-border)";
      case STAGE_STATUS.STARTED:
        return "var(--success-border)";
      case STAGE_STATUS.COMPLETED:
        return "var(--error-border)";
    }
  };
  return (
    <div
      classList={{
        "stages-map-marker": true,
        "stages-map-marker--live": props.stage.status === STAGE_STATUS.STARTED,
      }}
      style={{
        background: getMarkerColorByStatus(props.stage.status),
        color: getMarkerColorByStatus(props.stage.status),
      }}
    />
  );
}
