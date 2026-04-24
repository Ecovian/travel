"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import {
  calculateDistanceMeters,
  calculateRoute,
  DEFAULT_MAP_CENTER,
  formatRouteDistance,
  formatRouteDuration,
} from "@/lib/osm";
import type { MapMarker, RouteSummary } from "@/lib/types";

type MapSurfaceProps = {
  title: string;
  description: string;
  markers: MapMarker[];
  routeWaypoints?: MapMarker[];
  selectedMarkerId?: string;
  center?: {
    lat: number;
    lng: number;
  };
  onMarkerSelect?: (markerId: string) => void;
};

type LeafletModule = typeof import("leaflet");

const MARKER_COLORS = {
  search: "#0f766e",
  plan: "#17313c",
  active: "#ff8647",
};

function createMarkerIcon(leaflet: LeafletModule, color: string, active: boolean) {
  const size = active ? 36 : 28;

  return leaflet.divIcon({
    className: "travel-marker-icon",
    html: `<span style="
      display:block;
      width:${size}px;
      height:${size}px;
      border-radius:999px;
      background:${color};
      border:3px solid white;
      box-shadow:0 10px 24px rgba(23,49,60,0.22);
      transform:translate(-50%, -50%);
    "></span>`,
    iconAnchor: [0, 0],
  });
}

function getRouteKey(routeWaypoints: MapMarker[]) {
  return routeWaypoints.map((marker) => `${marker.lng},${marker.lat}`).join("|");
}

export function MapSurface({
  title,
  description,
  markers,
  routeWaypoints = [],
  selectedMarkerId,
  center = DEFAULT_MAP_CENTER,
  onMarkerSelect,
}: MapSurfaceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRefs = useRef<Leaflet.Marker[]>([]);
  const routeLineRef = useRef<Leaflet.Polyline | null>(null);
  const loadedTileCountRef = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tileStatus, setTileStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [routeSummary, setRouteSummary] = useState<RouteSummary>();
  const [routeError, setRouteError] = useState("");
  const routeKey = getRouteKey(routeWaypoints);
  const markersForMetrics = routeWaypoints.length ? routeWaypoints : markers;
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? markers[0];

  useEffect(() => {
    let cancelled = false;

    void import("leaflet")
      .then((leaflet) => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        leafletRef.current = leaflet;

        if (!mapRef.current) {
          mapRef.current = leaflet
            .map(mapContainerRef.current, {
              center: [center.lat, center.lng],
              zoom: 12,
              zoomControl: true,
            })
            .setView([center.lat, center.lng], 12);

          const tileLayer = leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
            });

          tileLayer.on("tileload", () => {
            loadedTileCountRef.current += 1;
            setTileStatus("ready");
          });
          tileLayer.on("load", () => setTileStatus("ready"));
          tileLayer.on("tileerror", () => {
            setTileStatus((current) => (loadedTileCountRef.current > 0 || current === "ready" ? "ready" : "fallback"));
          });
          tileLayer.addTo(mapRef.current);

          window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
          window.setTimeout(() => {
            setTileStatus((current) => (current === "loading" && loadedTileCountRef.current === 0 ? "fallback" : current));
          }, 2800);
        }

        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "지도를 불러오지 못했습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) {
      return;
    }

    mapRef.current.invalidateSize();
    mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom(), {
      animate: true,
    });
  }, [center.lat, center.lng, status]);

  useEffect(() => {
    if (status !== "ready" || !mapContainerRef.current) {
      return;
    }

    const invalidateSize = () => {
      mapRef.current?.invalidateSize();
    };
    const animationFrame = window.requestAnimationFrame(invalidateSize);
    const timers = [
      window.setTimeout(invalidateSize, 120),
      window.setTimeout(invalidateSize, 450),
      window.setTimeout(invalidateSize, 1200),
    ];
    const observer = new ResizeObserver(invalidateSize);

    observer.observe(mapContainerRef.current);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    if (routeWaypoints.length < 2) {
      setRouteSummary(undefined);
      setRouteStatus("idle");
      setRouteError("");
      return;
    }

    setRouteStatus("loading");
    setRouteError("");

    void calculateRoute(routeWaypoints.map((marker) => ({ lat: marker.lat, lng: marker.lng })))
      .then((route) => {
        if (cancelled) {
          return;
        }

        setRouteSummary(route);
        setRouteStatus(route ? "ready" : "idle");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setRouteSummary(undefined);
        setRouteStatus("error");
        setRouteError(error instanceof Error ? error.message : "경로 계산에 실패했습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [routeKey, routeWaypoints]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !leafletRef.current) {
      return;
    }

    const leaflet = leafletRef.current;
    const map = mapRef.current;

    markerRefs.current.forEach((marker) => marker.removeFrom(map));
    markerRefs.current = [];

    markers.forEach((marker) => {
      const active = marker.id === selectedMarkerId;
      const tone = active ? "active" : marker.tone ?? "search";
      const mapMarker = leaflet.marker([marker.lat, marker.lng], {
        icon: createMarkerIcon(leaflet, MARKER_COLORS[tone], active),
        title: marker.title,
      });

      mapMarker.on("click", () => onMarkerSelect?.(marker.id));
      mapMarker.bindTooltip(marker.title, {
        direction: "top",
        offset: [0, -18],
      });
      mapMarker.addTo(map);
      markerRefs.current.push(mapMarker);
    });
  }, [markers, onMarkerSelect, selectedMarkerId, status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !leafletRef.current) {
      return;
    }

    const leaflet = leafletRef.current;
    const map = mapRef.current;

    map.invalidateSize();

    if (routeLineRef.current) {
      routeLineRef.current.removeFrom(map);
      routeLineRef.current = null;
    }

    const boundsPoints: Leaflet.LatLngExpression[] = markers.map((marker) => [marker.lat, marker.lng]);

    if (routeSummary?.coordinates.length) {
      const routePoints = routeSummary.coordinates.map((coordinate) => [coordinate.lat, coordinate.lng] as Leaflet.LatLngTuple);
      routeLineRef.current = leaflet
        .polyline(routePoints, {
          color: "#ff8647",
          opacity: 0.88,
          weight: 5,
          lineCap: "round",
          lineJoin: "round",
        })
        .addTo(map);
      boundsPoints.push(...routePoints);
    }

    if (boundsPoints.length > 1) {
      map.fitBounds(leaflet.latLngBounds(boundsPoints), {
        padding: [38, 38],
        maxZoom: 15,
      });
      return;
    }

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14, {
        animate: true,
      });
    }
  }, [markers, routeSummary, status]);

  const mapCanvasPoints = buildMapCanvasPoints(markers, routeSummary, routeWaypoints);
  const shouldShowCanvasFallback = markers.length > 0 && tileStatus !== "ready";
  const locationRows = markersForMetrics.slice(0, 8).map((marker, index) => {
    const previous = markersForMetrics[index - 1];
    const distanceFromPrevious = previous ? calculateDistanceMeters(previous, marker) : undefined;
    const distanceFromSelected =
      selectedMarker && selectedMarker.id !== marker.id ? calculateDistanceMeters(selectedMarker, marker) : undefined;

    return {
      ...marker,
      distanceText: distanceFromPrevious
        ? `이전 장소에서 ${formatRouteDistance(distanceFromPrevious)}`
        : distanceFromSelected
          ? `선택 장소에서 ${formatRouteDistance(distanceFromSelected)}`
          : "기준 위치",
    };
  });

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-2">
        <p className="hero-badge">OSM + OSRM</p>
        <div>
          <h2 className="text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-[rgba(23,49,60,0.68)]">{description}</p>
        </div>
      </div>

      <div className="map-frame relative h-[360px] min-h-[360px] sm:h-[420px] sm:min-h-[420px]">
        <div className="absolute inset-0 h-full w-full" ref={mapContainerRef} />

        {shouldShowCanvasFallback ? (
          <div className="map-canvas-overlay absolute inset-0 overflow-hidden">
            <div className="map-canvas-grid absolute inset-0" />
            {mapCanvasPoints.routePoints.length > 1 ? (
              <svg
                className="map-canvas-route absolute inset-0 h-full w-full"
                role="presentation"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  points={mapCanvasPoints.routePoints.map((point) => `${point.x},${point.y}`).join(" ")}
                  stroke="#ff8647"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.4"
                />
              </svg>
            ) : null}
            {mapCanvasPoints.markerPoints.map((point, index) => {
              const selected = point.id === selectedMarkerId;

              return (
                <button
                  className={`map-canvas-pin ${selected ? "map-canvas-pin-selected" : ""}`}
                  key={point.id}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  title={point.title}
                  type="button"
                  onClick={() => onMarkerSelect?.(point.id)}
                >
                  <span>{index + 1}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {status === "loading" && !markers.length ? (
          <div className="empty-state absolute inset-0">
            <p className="text-base font-semibold">OpenStreetMap 지도를 준비하고 있습니다.</p>
          </div>
        ) : null}

        {status === "error" && !markers.length ? (
          <div className="empty-state absolute inset-0">
            <p className="text-base font-semibold">지도를 불러오지 못했습니다.</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-[rgba(23,49,60,0.62)]">
              {errorMessage || "OpenStreetMap 타일 로드 상태를 확인해 주세요."}
            </p>
          </div>
        ) : null}

        {status === "ready" && !markers.length ? (
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/88 px-4 py-3 text-sm text-[rgba(23,49,60,0.68)] shadow-lg">
            검색 결과나 저장한 장소가 여기에 표시됩니다.
          </div>
        ) : null}

        {status === "ready" ? (
          <div className="absolute right-4 top-4 z-[650] max-w-[calc(100%-2rem)] rounded-2xl bg-white/90 px-4 py-3 text-sm text-[rgba(23,49,60,0.72)] shadow-lg backdrop-blur">
            {tileStatus === "fallback" ? "핀 지도 · " : null}
            {routeStatus === "loading" ? "OSRM 경로 계산 중" : null}
            {routeStatus === "ready" && routeSummary
              ? `자동 동선 ${formatRouteDistance(routeSummary.distanceMeters)} · ${formatRouteDuration(routeSummary.durationSeconds)}`
              : null}
            {routeStatus === "error" ? routeError : null}
            {routeStatus === "idle" ? "장소 2개 이상이면 경로가 표시됩니다." : null}
          </div>
        ) : null}
      </div>

      {locationRows.length ? (
        <div className="mt-4 grid gap-3">
          {locationRows.map((marker, index) => (
            <button
              className={`flex w-full items-start gap-3 rounded-[18px] border px-4 py-3 text-left transition ${
                selectedMarkerId === marker.id
                  ? "border-[rgba(255,134,71,0.42)] bg-[rgba(255,134,71,0.12)]"
                  : "border-[rgba(23,49,60,0.1)] bg-white/60 hover:border-[rgba(15,118,110,0.28)]"
              }`}
              key={marker.id}
              type="button"
              onClick={() => onMarkerSelect?.(marker.id)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{marker.title}</span>
                <span className="mt-1 block text-xs text-[rgba(23,49,60,0.58)]">
                  위도 {marker.lat.toFixed(5)} · 경도 {marker.lng.toFixed(5)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[rgba(15,118,110,0.1)] px-3 py-2 text-xs font-semibold text-tide">
                {marker.distanceText}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function buildMapCanvasPoints(markers: MapMarker[], routeSummary?: RouteSummary, routeWaypoints: MapMarker[] = []) {
  const routeCoordinates =
    routeSummary?.coordinates.length
      ? routeSummary.coordinates
      : routeWaypoints.map((marker) => ({ lat: marker.lat, lng: marker.lng }));
  const allCoordinates = [
    ...markers.map((marker) => ({ lat: marker.lat, lng: marker.lng })),
    ...routeCoordinates,
  ];

  if (!allCoordinates.length) {
    return {
      markerPoints: [],
      routePoints: [],
    };
  }

  const latitudes = allCoordinates.map((coordinate) => coordinate.lat);
  const longitudes = allCoordinates.map((coordinate) => coordinate.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);

  const project = (coordinate: { lat: number; lng: number }) => ({
    x: 10 + ((coordinate.lng - minLng) / lngSpan) * 80,
    y: 10 + ((maxLat - coordinate.lat) / latSpan) * 80,
  });

  return {
    markerPoints: markers.map((marker) => ({
      ...project(marker),
      id: marker.id,
      title: marker.title,
    })),
    routePoints: routeCoordinates.map(project),
  };
}
