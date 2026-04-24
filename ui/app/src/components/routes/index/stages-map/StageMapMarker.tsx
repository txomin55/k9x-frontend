import { Stage } from "@/services/fetch-stages/fetchStages.types";

interface StageMapMarker {
  stage: Stage;
}

export function StageMapMarkerPopup(props: StageMapMarker) {
  return <div class="stages-map-marker-popup">{JSON.stringify(props)}</div>;
}

export function StageMapMarker(props: StageMapMarker) {
  return <div class="stages-map-marker" />;
}
