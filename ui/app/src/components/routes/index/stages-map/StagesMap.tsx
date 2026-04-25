import { createMemo, onCleanup, onMount } from "solid-js";
import L from "leaflet";
import { StageSummary } from "@/services/fetch-stages/fetchStages.types";
import { StageMapMarker, StageMapMarkerPopup } from "@/components/routes/index/stages-map/StageMapMarker";
import { render } from "solid-js/web";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";
import "./styles.css";

interface StagesMapProps {
  stages: StageSummary[] | undefined;
}

export default function StagesMap(_props: StagesMapProps) {
  let mapEl!: HTMLDivElement;
  let map: L.Map | undefined;
  let resizeObserver: ResizeObserver | undefined;
  const disposers: Array<() => void> = [];

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

  const getIconStyle = (stage: StageSummary) => {
    const container = document.createElement("div");
    const dispose = render(() => <StageMapMarker stage={stage} />, container);

    disposers.push(dispose);

    return L.divIcon({
      className: "stage-map-marker",
      html: container,
    });
  };

  const markers = createMemo(() => {
    const points = [
      {
        id: "1",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "es",
        description: "--desc 1",
        name: "Pozo A",
        location: { address: "Bilbao", latitude: 43.263, longitude: -2.935 },
      },
      {
        id: "2",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "2",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "es",
        description: "--desc 2",
        name: "Pozo B",
        location: { address: "Bilbao", latitude: 43.264, longitude: -2.936 },
      },
      {
        id: "3",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "3",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "es",
        description: "--desc 3",
        name: "Pozo C",
        location: { address: "Bilbao", latitude: 43.265, longitude: -2.937 },
      },
      {
        id: "4",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "4",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "es",
        description: "--desc 4",
        name: "Pozo D",
        location: { address: "Bilbao", latitude: 43.2652, longitude: -2.9368 },
      },
      {
        id: "5",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "5",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "pt",
        description: "--desc portugal",
        name: "Pozo Portugal",
        location: { address: "Lisboa", latitude: 38.7223, longitude: -9.1393 },
      },
      {
        id: "6",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "6",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
          {
            id: "1",
            discipline: "obdx",
            competitors: 1,
            name: "--event name 2",
          },
        ],
        country: "fr",
        description: "--desc francia",
        name: "Pozo Francia",
        location: { address: "París", latitude: 48.8566, longitude: 2.3522 },
      },
      {
        id: "7",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "7",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
        ],
        country: "it",
        description: "--desc italia",
        name: "Pozo Italia",
        location: { address: "Roma", latitude: 41.9028, longitude: 12.4964 },
      },
      {
        id: "8",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "8",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
        ],
        country: "de",
        description: "--desc alemania",
        name: "Pozo Alemania",
        location: { address: "Berlín", latitude: 52.52, longitude: 13.405 },
      },
      {
        id: "9",
        dateFrom: 123,
        dateTo: 123,
        events: [
          {
            id: "9",
            discipline: "obdx",
            competitors: 1,
            name: "--event name",
          },
        ],
        country: "ru",
        description: "--desc moscu",
        name: "Pozo Moscú",
        location: {
          address: "Moscú",
          latitude: 55.7558,
          longitude: 37.6173,
        },
      },
    ] as StageSummary[];

    return points.map((stage) => {
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

      return marker;
    });
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
