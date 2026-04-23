import { onCleanup, onMount } from "solid-js";
import L from "leaflet";
import { Stage } from "@/services/fetch-stages/fetchStages.types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

interface Point {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status?: "ok" | "warn" | "error";
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface StagesMapProps {
  stages: Stage[] | undefined;
}

const points: Point[] = [
  { id: "1", name: "Pozo A", lat: 43.263, lng: -2.935, status: "ok" },
  { id: "2", name: "Pozo B", lat: 43.264, lng: -2.936, status: "warn" },
  { id: "3", name: "Pozo C", lat: 43.265, lng: -2.937, status: "error" },
  { id: "4", name: "Pozo D", lat: 43.2652, lng: -2.9368, status: "ok" },
];

export default function StagesMap(_props: StagesMapProps) {
  let mapEl!: HTMLDivElement;
  let map: L.Map | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let clusterGroup: L.MarkerClusterGroup | undefined;

  onMount(() => {
    map = L.map(mapEl, {
      zoomControl: true,
    }).setView([43.264, -2.936], 13);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      },
    ).addTo(map);

    clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 15,
      maxClusterRadius: 120,
      removeOutsideVisibleBounds: true,
      animate: true,
    });

    map.addLayer(clusterGroup);

    const markers: L.Marker[] = points.map((p) => {
      const marker = L.marker([p.lat, p.lng]);

      marker.bindPopup(`
        <div>
          <strong>${p.name}</strong><br/>
          ${p.status ? `Estado: ${p.status}` : ""}
          <br/>
          ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}
        </div>
      `);

      return marker;
    });

    clusterGroup.addLayers(markers);

    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points.map((p) => [p.lat, p.lng] as [number, number]),
      );

      map.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: 14,
      });
    }

    const fixSize = () => {
      if (!map) return;
      map.invalidateSize(true);
    };

    requestAnimationFrame(fixSize);
    setTimeout(fixSize, 50);
    setTimeout(fixSize, 200);

    resizeObserver = new ResizeObserver(() => {
      fixSize();
    });

    resizeObserver.observe(mapEl);

    map.on("zoomend", () => {
      console.log("zoom actual:", map?.getZoom());
    });
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    map?.remove();
  });

  return (
    <div
      ref={mapEl}
      style={{
        height: "90%",
        width: "100%",
        "min-width": "0",
      }}
    />
  );
}
