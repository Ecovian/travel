"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTrips } from "@/hooks/use-trips";
import { buildNearbySearchKeyword, searchNearbyPlaces, searchPlacesByKeyword } from "@/lib/osm";
import { suggestedKeywords } from "@/lib/mock-data";
import type { NearbyCategory, PlaceSearchStatus, PlaceSummary } from "@/lib/types";
import { MapSurface } from "@/components/shared/map-surface";
import { PlaceSearchPanel } from "@/components/shared/place-search-panel";

export function ExplorePageClient() {
  const { recentTrip } = useTrips();
  const [query, setQuery] = useState("성수 브런치");
  const [results, setResults] = useState<PlaceSummary[]>([]);
  const [status, setStatus] = useState<PlaceSearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const [nearbyMode, setNearbyMode] = useState<NearbyCategory | undefined>(undefined);

  const selectedPlace = results.find((place) => place.id === selectedPlaceId) ?? results[0];

  const handleSearch = async (nextQuery: string) => {
    const trimmed = nextQuery.trim();

    setQuery(nextQuery);
    setNearbyMode(undefined);
    setErrorMessage("");

    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      setSelectedPlaceId(undefined);
      return;
    }

    setStatus("loading");

    try {
      const places = await searchPlacesByKeyword(trimmed);
      setResults(places);
      setStatus(places.length ? "success" : "empty");
      setSelectedPlaceId(places[0]?.id);
    } catch (error) {
      setResults([]);
      setSelectedPlaceId(undefined);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "장소 검색에 실패했습니다.");
    }
  };

  const handleNearbySearch = async (category: NearbyCategory) => {
    if (!selectedPlace) {
      return;
    }

    setNearbyMode(category);
    setQuery(buildNearbySearchKeyword(selectedPlace, category));
    setErrorMessage("");
    setStatus("loading");

    try {
      const places = await searchNearbyPlaces(selectedPlace, category);
      setResults(places);
      setStatus(places.length ? "success" : "empty");
      setSelectedPlaceId(places[0]?.id ?? selectedPlace.id);
    } catch (error) {
      setResults([]);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "주변 장소를 찾지 못했습니다.");
    }
  };

  useEffect(() => {
    void handleSearch(query);
  }, []);

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <span className="hero-badge">Explore with OpenStreetMap</span>
            <h1 className="section-title max-w-3xl">
              도시 분위기를 검색하고, 지금 저장된 여행으로 곧바로 연결하세요.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgba(23,49,60,0.72)] sm:text-lg">
              OpenStreetMap 장소 검색 결과를 지도와 카드로 동시에 보고, 마음에 드는 장소를 플래너에서 바로
              이어서 정리할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Search Results
              </p>
              <p className="mt-3 text-3xl font-semibold">{results.length}</p>
              <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">현재 키워드 기준 장소 수</p>
            </article>
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Active Keyword
              </p>
              <p className="mt-3 text-xl font-semibold">{query}</p>
              <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">바꿔가며 비교 탐색 가능</p>
            </article>
            <article className="mini-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                Recent Planner
              </p>
              <p className="mt-3 text-xl font-semibold">{recentTrip?.title ?? "없음"}</p>
              <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">최근 일정과 바로 연결</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PlaceSearchPanel
          title="여행지 탐색"
          description="도시, 맛집, 전망대, 카페처럼 자유 키워드로 검색하고 원하는 장소를 지도에서 집중해서 볼 수 있습니다."
          query={query}
          onQueryChange={setQuery}
          onSubmit={(nextQuery) => {
            void handleSearch(nextQuery);
          }}
          status={status}
          errorMessage={errorMessage}
          results={results}
          selectedPlaceId={selectedPlaceId}
          suggestedKeywords={suggestedKeywords}
          onSelectPlace={(place) => {
            setSelectedPlaceId(place.id);
          }}
          nearbyAnchor={selectedPlace}
          nearbyMode={nearbyMode}
          onNearbySearch={(category) => {
            void handleNearbySearch(category);
          }}
          footer={
            recentTrip ? (
              <Link className="secondary-link w-full justify-center" href={`/planner/${recentTrip.id}`}>
                최근 일정 "{recentTrip.title}" 열기
              </Link>
            ) : (
              <Link className="secondary-link w-full justify-center" href="/planner">
                먼저 여행 일정 만들기
              </Link>
            )
          }
        />

        <MapSurface
          title="탐색 지도"
          description="선택한 장소를 중심으로 OpenStreetMap 타일 위에 검색 결과를 표시합니다."
          markers={results.map((place) => ({
            id: place.id,
            title: place.name,
            lat: place.lat,
            lng: place.lng,
            tone: "search",
          }))}
          selectedMarkerId={selectedPlace?.id}
          center={
            selectedPlace
              ? {
                  lat: selectedPlace.lat,
                  lng: selectedPlace.lng,
                }
              : undefined
          }
          onMarkerSelect={(markerId) => {
            setSelectedPlaceId(markerId);
          }}
        />
      </section>
    </div>
  );
}
