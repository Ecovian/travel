"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { suggestedKeywords } from "@/lib/mock-data";
import { buildNearbySearchKeyword, searchNearbyPlaces, searchPlacesByKeyword } from "@/lib/osm";
import {
  addPlaceToTripDay,
  formatTripDateRange,
  getTripItemCount,
  getTripLength,
  moveTripItem,
  removeTripItem,
  updateTripItemMemo,
} from "@/lib/trip-utils";
import type { MapMarker, NearbyCategory, PlaceSearchStatus, PlaceSummary, Trip } from "@/lib/types";
import { MapSurface } from "@/components/shared/map-surface";
import { PlaceSearchPanel } from "@/components/shared/place-search-panel";

type TripWorkspaceProps = {
  trip: Trip;
  onSaveTrip: (trip: Trip) => void;
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function TripWorkspace({
  trip,
  onSaveTrip,
  backHref,
  backLabel,
  eyebrow = "Trip detail board",
  actions,
}: TripWorkspaceProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSummary[]>([]);
  const [status, setStatus] = useState<PlaceSearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [nearbyMode, setNearbyMode] = useState<NearbyCategory | undefined>(undefined);
  const autoSearchTripId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (selectedDayIndex > trip.days.length - 1) {
      setSelectedDayIndex(0);
    }
  }, [selectedDayIndex, trip.days.length]);

  const runSearch = async (nextQuery: string) => {
    const trimmed = nextQuery.trim();

    setQuery(nextQuery);
    setNearbyMode(undefined);
    setErrorMessage("");

    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");

    try {
      const places = await searchPlacesByKeyword(trimmed);
      setResults(places);
      setStatus(places.length ? "success" : "empty");
      setSelectedMarkerId((current) => (places.some((place) => place.id === current) ? current : places[0]?.id));
    } catch (error) {
      setResults([]);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "장소 검색에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (autoSearchTripId.current === trip.id) {
      return;
    }

    autoSearchTripId.current = trip.id;
    const initialKeyword = `${trip.destination} 여행지`;
    setQuery(initialKeyword);
    void runSearch(initialKeyword);
  }, [trip.destination, trip.id]);

  const plannerItems = trip.days.flatMap((day, dayIndex) =>
    day.items.map((item) => ({
      ...item,
      dayIndex,
      markerTitle: `${day.label} · ${item.name}`,
    })),
  );

  const plannerPlaceIds = new Set(plannerItems.map((item) => item.placeId));
  const mapMarkers: MapMarker[] = [
    ...plannerItems.map((item) => ({
      id: item.id,
      title: item.markerTitle,
      lat: item.lat,
      lng: item.lng,
      tone: "plan" as const,
    })),
    ...results
      .filter((place) => !plannerPlaceIds.has(place.id))
      .map((place) => ({
        id: place.id,
        title: place.name,
        lat: place.lat,
        lng: place.lng,
        tone: "search" as const,
      })),
  ];

  const selectedPlace =
    results.find((place) => place.id === selectedMarkerId) ??
    plannerItems.find((item) => item.id === selectedMarkerId);
  const nearbyAnchor = selectedPlace ?? trip.days[selectedDayIndex]?.items[0];

  const runNearbySearch = async (category: NearbyCategory) => {
    if (!nearbyAnchor) {
      return;
    }

    setNearbyMode(category);
    setQuery(buildNearbySearchKeyword(nearbyAnchor, category));
    setErrorMessage("");
    setStatus("loading");

    try {
      const places = await searchNearbyPlaces(nearbyAnchor, category);
      setResults(places);
      setStatus(places.length ? "success" : "empty");
      setSelectedMarkerId(places[0]?.id ?? nearbyAnchor.id);
    } catch (error) {
      setResults([]);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "주변 장소를 찾지 못했습니다.");
    }
  };

  const commitTripUpdate = (updater: (current: Trip) => Trip) => {
    onSaveTrip(updater(trip));
  };

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="hero-badge">{eyebrow}</span>
              <Link className="secondary-link px-4 py-2 text-xs" href={backHref}>
                {backLabel}
              </Link>
              {actions}
            </div>
            <div>
              <h1 className="section-title max-w-3xl">{trip.title}</h1>
              <p className="mt-3 text-lg font-semibold text-tide">{trip.destination}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(23,49,60,0.72)]">
                {formatTripDateRange(trip)} 일정입니다. 원하는 Day를 선택한 뒤 장소를 추가하고, 순서를
                조정하면서 핀 위치와 거리를 확인해 보세요.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Trip Days
              </p>
              <p className="mt-3 text-3xl font-semibold">{getTripLength(trip)}</p>
            </article>
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Saved Places
              </p>
              <p className="mt-3 text-3xl font-semibold">{getTripItemCount(trip)}</p>
            </article>
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Active Day
              </p>
              <p className="mt-3 text-xl font-semibold">{trip.days[selectedDayIndex]?.label}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {trip.days.map((day, index) => (
                <button
                  key={day.date}
                  className={`chip-button ${selectedDayIndex === index ? "border-[rgba(255,134,71,0.4)] bg-[rgba(255,134,71,0.12)]" : ""}`}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="hero-badge">Itinerary board</p>
              <div>
                <h2 className="text-2xl">Day별 일정표</h2>
                <p className="mt-2 text-sm leading-7 text-[rgba(23,49,60,0.68)]">
                  카드를 누르면 지도 포커스가 이동하고, 메모와 순서 변경은 바로 저장됩니다.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {trip.days.map((day, dayIndex) => (
                <article
                  key={day.date}
                  className={`rounded-[26px] border p-4 sm:p-5 ${
                    selectedDayIndex === dayIndex
                      ? "border-[rgba(255,134,71,0.35)] bg-[rgba(255,134,71,0.08)]"
                      : "border-[rgba(23,49,60,0.08)] bg-white/60"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl">{day.label}</h3>
                      <p className="mt-1 text-sm text-[rgba(23,49,60,0.6)]">{day.date}</p>
                    </div>
                    <button
                      className="secondary-link px-4 py-2 text-xs"
                      type="button"
                      onClick={() => setSelectedDayIndex(dayIndex)}
                    >
                      이 Day에 추가하기
                    </button>
                  </div>

                  {day.items.length ? (
                    <div className="mt-4 space-y-3">
                      {day.items.map((item, itemIndex) => (
                        <article
                          key={item.id}
                          className={`rounded-[22px] border p-4 transition ${
                            selectedMarkerId === item.id
                              ? "border-[rgba(15,118,110,0.35)] bg-[rgba(15,118,110,0.1)]"
                              : "border-[rgba(23,49,60,0.08)] bg-white/72"
                          }`}
                          onClick={() => {
                            setSelectedMarkerId(item.id);
                            setSelectedDayIndex(dayIndex);
                          }}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.44)]">
                                Stop {itemIndex + 1}
                              </p>
                              <h4 className="text-xl">{item.name}</h4>
                              <p className="text-sm leading-7 text-[rgba(23,49,60,0.64)]">{item.address}</p>
                              <p className="text-xs font-semibold text-[rgba(23,49,60,0.48)]">
                                위도 {item.lat.toFixed(5)} · 경도 {item.lng.toFixed(5)}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              <button
                                className="secondary-link px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={itemIndex === 0}
                                type="button"
                                onClick={() =>
                                  commitTripUpdate((current) =>
                                    moveTripItem(current, dayIndex, item.id, "up"),
                                  )
                                }
                              >
                                위로
                              </button>
                              <button
                                className="secondary-link px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={itemIndex === day.items.length - 1}
                                type="button"
                                onClick={() =>
                                  commitTripUpdate((current) =>
                                    moveTripItem(current, dayIndex, item.id, "down"),
                                  )
                                }
                              >
                                아래로
                              </button>
                              <button
                                className="secondary-link px-4 py-2 text-xs"
                                type="button"
                                onClick={() =>
                                  commitTripUpdate((current) => removeTripItem(current, dayIndex, item.id))
                                }
                              >
                                삭제
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="field-label" htmlFor={`${item.id}-memo`}>
                              메모
                            </label>
                            <textarea
                              id={`${item.id}-memo`}
                              className="field-textarea min-h-[88px]"
                              value={item.memo ?? ""}
                              onChange={(event) =>
                                commitTripUpdate((current) =>
                                  updateTripItemMemo(current, dayIndex, item.id, event.target.value),
                                )
                              }
                              placeholder="예: 예약 시간, 이동 팁, 꼭 먹을 메뉴"
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="ghost-card mt-4 p-5">
                      <p className="text-sm font-semibold text-[rgba(23,49,60,0.62)]">
                        아직 이 날짜에 추가된 장소가 없습니다.
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(23,49,60,0.6)]">
                        오른쪽 검색 패널에서 장소를 찾고 "이 Day에 추가" 버튼으로 일정을 채워 보세요.
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <MapSurface
            title="여행 동선 지도"
            description="저장한 장소는 경로선으로 연결하고, 검색 결과는 같은 지도 위에 핀으로 표시합니다."
            markers={mapMarkers}
            routeWaypoints={plannerItems.map((item) => ({
              id: item.id,
              title: item.markerTitle,
              lat: item.lat,
              lng: item.lng,
              tone: "plan",
            }))}
            selectedMarkerId={selectedMarkerId}
            center={
              selectedPlace
                ? {
                    lat: selectedPlace.lat,
                    lng: selectedPlace.lng,
                  }
                : undefined
            }
            onMarkerSelect={(markerId) => {
              setSelectedMarkerId(markerId);
              const plannerMatch = plannerItems.find((item) => item.id === markerId);

              if (plannerMatch) {
                setSelectedDayIndex(plannerMatch.dayIndex);
              }
            }}
          />

          <PlaceSearchPanel
            title="장소 검색 후 일정에 추가"
            description={`현재 선택한 ${trip.days[selectedDayIndex]?.label}에 장소를 바로 담을 수 있습니다.`}
            query={query}
            onQueryChange={setQuery}
            onSubmit={(nextQuery) => {
              void runSearch(nextQuery);
            }}
            status={status}
            errorMessage={errorMessage}
            results={results}
            selectedPlaceId={results.some((place) => place.id === selectedMarkerId) ? selectedMarkerId : undefined}
            suggestedKeywords={suggestedKeywords}
            onSelectPlace={(place) => {
              setSelectedMarkerId(place.id);
            }}
            nearbyAnchor={nearbyAnchor}
            nearbyMode={nearbyMode}
            onNearbySearch={(category) => {
              void runNearbySearch(category);
            }}
            actionLabel="이 Day에 추가"
            onAction={(place) => {
              const next = addPlaceToTripDay(trip, selectedDayIndex, place);
              const addedItem = next.days[selectedDayIndex]?.items.at(-1);

              if (addedItem) {
                setSelectedMarkerId(addedItem.id);
              }

              onSaveTrip(next);
            }}
            footer={
              <div className="rounded-[22px] border border-[rgba(23,49,60,0.1)] bg-white/58 px-4 py-3 text-sm text-[rgba(23,49,60,0.68)]">
                선택 중인 날짜: <span className="font-semibold text-ink">{trip.days[selectedDayIndex]?.label}</span>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
