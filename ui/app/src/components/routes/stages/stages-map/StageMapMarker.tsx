import { StageSummary } from "@/services/fetch-stages/fetchStages.types";
import { Index } from "solid-js";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";

interface StageMapMarker {
  stage: StageSummary;
}

const STAGE_STATUS = {
  PENDING: "pending",
  STARTED: "started",
  COMPLETED: "completed",
};

export function StageMapMarkerPopup(props: StageMapMarker) {
  const navigate = useNavigate();
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

  return (
    <div class="stages-map-marker-popup">
      <span class="stages-map-marker-popup__title">
        <span class="text-body-md">{props.stage.name}</span>
        <span class="text-caption-sm">
          {props.stage.dateFrom}-{props.stage.dateTo}
        </span>
      </span>
      <span class="text-body-sm">{props.stage.description}</span>
      <AtomButton
        type={BUTTON_TYPES.ACCENT}
        onClick={() => navigateToStageInfo(props.stage.id)}
      >
        --+Info
      </AtomButton>

      <Index each={props.stage.events}>
        {(event) => (
          <div class="stages-map-marker-popup__row">
            <div class="stages-map-marker-popup__row--title">
              <span>{event().status}</span>
              <span>
                {event().name} {event().discipline}
              </span>
            </div>
            <AtomButton onClick={() => navigateToClassification(event().id)}>
              --View Qualifications
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
