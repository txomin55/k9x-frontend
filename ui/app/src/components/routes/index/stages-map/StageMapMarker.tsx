import { StageSummary } from "@/services/fetch-stages/fetchStages.types";
import { Index } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";

interface StageMapMarker {
  stage: StageSummary;
}

const STAGE_STATUS = {
  PENDING: "pending",
  STARTED: "started",
  COMPLETED: "completed",
};

export function StageMapMarkerPopup(props: StageMapMarker) {
  return (
    <div class="stages-map-marker-popup">
      <span class="stages-map-marker-popup__title">
        <span class="text-body-md">{props.stage.name}</span>
        <span class="text-caption-sm">
          {props.stage.dateFrom}-{props.stage.dateTo}
        </span>
      </span>
      <span class="text-body-sm">{props.stage.description}</span>

      <Index each={props.stage.events}>
        {(event) => (
          <div class="stages-map-marker-popup__row">
            <div class="stages-map-marker-popup__row--title">
              <span>{event().status}</span>
              <span>
                {event().name} {event().discipline}
              </span>
            </div>
            <AtomButton>--View Qualifications</AtomButton>
          </div>
        )}
      </Index>
    </div>
  );
}

export function StageMapMarker(props: StageMapMarker) {
  const getMarkerColorByStatus = (status) => {
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
      class="stages-map-marker"
      style={{ background: getMarkerColorByStatus(props.stage.status) }}
    />
  );
}
