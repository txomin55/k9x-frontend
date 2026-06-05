import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import L from "leaflet";
import { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { StageMapMarker, StageMapMarkerPopup } from "@/components/routes/stages/stages-map/StageMapMarker";
import { render } from "solid-js/web";
import { isDark } from "@/stores/theme/theme";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";
import "./styles.css";

interface StagesMapProps {
  stages: StageSummaryResponseDTO[];
}

export default function StagesMap(props: StagesMapProps) {
  let mapEl!: HTMLDivElement;
  let map: L.Map | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let tileLayer: L.TileLayer | undefined;
  const disposers: Array<() => void> = [];
  const markerByStage = new Map<string, L.Marker>();
  const [mapReady, setMapReady] = createSignal(false);
  const [stageParam, setStageParam] = useSearchParam("stage", "");

  const clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 10,
    maxClusterRadius: (zoom) => (zoom < 6 ? 100 : 300),
    removeOutsideVisibleBounds: true,
    animate: true,
  });

  const fixSize = () => {
    if (!map) return;
    map.invalidateSize(true);
  };

  const getIconStyle = (stage: StageSummaryResponseDTO) => {
    const container = document.createElement("div");
    const dispose = render(() => <StageMapMarker stage={stage} />, container);

    disposers.push(dispose);

    return L.divIcon({
      className: "stage-map-marker",
      html: container,
    });
  };

  const markers = createMemo(() => {
    markerByStage.clear();
    return props.stages.map((stage) => {
      const marker = L.marker(
        [stage?.location?.latitude ?? 0, stage?.location?.longitude ?? 0],
        { icon: getIconStyle(stage) },
      );

      const container = document.createElement("div");
      const dispose = render(
        () => <StageMapMarkerPopup stage={stage} />,
        container,
      );

      disposers.push(dispose);
      marker.bindPopup(container);

      marker.on("popupopen", () => {
        if (stageParam() !== stage.id) setStageParam(stage.id);
      });
      marker.on("popupclose", () => {
        if (stageParam() === stage.id) setStageParam("");
      });

      markerByStage.set(stage.id, marker);

      return marker;
    });
  });

  createEffect(() => {
    const id = stageParam();
    if (!mapReady() || !map || !id) return;

    const marker = markerByStage.get(id);
    if (!marker || marker.isPopupOpen()) return;

    clusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
  });

  const getTileLayerUrl = (isDark: boolean) =>
    isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const addTileLayer = (isDark: boolean) => {
    if (!map) return;

    tileLayer?.remove();

    tileLayer = L.tileLayer(getTileLayerUrl(isDark), {
      maxZoom: 20,
    }).addTo(map);
  };

  createEffect(() => {
    addTileLayer(isDark());
  });

  onMount(() => {
    map = L.map(mapEl, {
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 20,
      },
    ).addTo(map);

    map.addLayer(clusterGroup);
    clusterGroup.addLayers(markers());

    const bounds = clusterGroup.getBounds();

    map.fitBounds(bounds, {
      paddingTopLeft: [80, 80],
      paddingBottomRight: [80, 160],
      maxZoom: 4,
    });

    setMapReady(true);

    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (!map) {
          return;
        }

        fixSize();

        const bounds = clusterGroup.getBounds();

        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [48, 48],
            maxZoom: 5,
            animate: false,
          });
        }
      });
    });

    resizeObserver.observe(mapEl);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        fixSize();
      }, 250);
    });
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    map?.remove();
    disposers.forEach((dispose) => dispose());
  });

  return <div class="stages-map" ref={mapEl} />;
}
