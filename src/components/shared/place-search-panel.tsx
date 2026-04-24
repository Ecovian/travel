"use client";

import type { ReactNode } from "react";
import { getDistanceLabel } from "@/lib/osm";
import type { NearbyCategory, PlaceSearchStatus, PlaceSummary, TripItem } from "@/lib/types";

type PlaceSearchPanelProps = {
  title: string;
  description: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (query: string) => void;
  status: PlaceSearchStatus;
  errorMessage?: string;
  results: PlaceSummary[];
  selectedPlaceId?: string;
  suggestedKeywords: string[];
  actionLabel?: string;
  onAction?: (place: PlaceSummary) => void;
  onSelectPlace: (place: PlaceSummary) => void;
  footer?: ReactNode;
  nearbyAnchor?: PlaceSummary | TripItem;
  nearbyMode?: NearbyCategory;
  onNearbySearch?: (category: NearbyCategory) => void;
};

function getStatusMessage(status: PlaceSearchStatus, errorMessage?: string) {
  switch (status) {
    case "loading":
      return "장소를 검색하는 중입니다.";
    case "empty":
      return "검색 결과가 없습니다. 다른 키워드로 다시 시도해 보세요.";
    case "error":
      return errorMessage || "검색 중 오류가 발생했습니다.";
    case "success":
      return "결과 카드에서 지도를 포커스하거나 일정에 추가할 수 있습니다.";
    default:
      return "추천 키워드나 원하는 지역명을 입력해 검색을 시작해 보세요.";
  }
}

export function PlaceSearchPanel({
  title,
  description,
  query,
  onQueryChange,
  onSubmit,
  status,
  errorMessage,
  results,
  selectedPlaceId,
  suggestedKeywords,
  actionLabel,
  onAction,
  onSelectPlace,
  footer,
  nearbyAnchor,
  nearbyMode,
  onNearbySearch,
}: PlaceSearchPanelProps) {
  const canSearchNearby = Boolean(nearbyAnchor && onNearbySearch);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="hero-badge">Place search</p>
        <div>
          <h2 className="text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-[rgba(23,49,60,0.68)]">{description}</p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(query);
        }}
      >
        <input
          className="field-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="예: 성수 브런치, 제주 숙소, 오사카 전망대"
        />
        <button className="primary-link w-full sm:w-auto" type="submit">
          검색
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedKeywords.map((keyword) => (
          <button
            key={keyword}
            className="chip-button"
            type="button"
            onClick={() => {
              onQueryChange(keyword);
              onSubmit(keyword);
            }}
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          className={`chip-button w-full justify-center ${
            nearbyMode === "food" ? "border-[rgba(255,134,71,0.42)] bg-[rgba(255,134,71,0.12)]" : ""
          } disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={!canSearchNearby}
          type="button"
          onClick={() => onNearbySearch?.("food")}
        >
          근처 먹거리
        </button>
        <button
          className={`chip-button w-full justify-center ${
            nearbyMode === "cafe" ? "border-[rgba(255,134,71,0.42)] bg-[rgba(255,134,71,0.12)]" : ""
          } disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={!canSearchNearby}
          type="button"
          onClick={() => onNearbySearch?.("cafe")}
        >
          근처 카페
        </button>
      </div>

      {nearbyAnchor ? (
        <p className="mt-3 text-xs font-semibold text-[rgba(23,49,60,0.52)]">
          기준 위치: {nearbyAnchor.name}
        </p>
      ) : null}

      <div className="mt-5 rounded-[22px] border border-[rgba(23,49,60,0.1)] bg-white/60 px-4 py-3 text-sm text-[rgba(23,49,60,0.68)]">
        {getStatusMessage(status, errorMessage)}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}

      <div className="mt-5 space-y-3">
        {results.map((place) => {
          const selected = selectedPlaceId === place.id;

          return (
            <article
              key={place.id}
              className={`cursor-pointer rounded-[24px] border p-4 transition ${
                selected
                  ? "border-[rgba(255,134,71,0.45)] bg-[rgba(255,134,71,0.12)]"
                  : "border-[rgba(23,49,60,0.1)] bg-white/62 hover:border-[rgba(15,118,110,0.3)] hover:bg-[rgba(15,118,110,0.06)]"
              }`}
              onClick={() => onSelectPlace(place)}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.46)]">
                    {place.category || "place"}
                  </p>
                  <h3 className="text-xl">{place.name}</h3>
                  <p className="text-sm leading-7 text-[rgba(23,49,60,0.64)]">{place.address}</p>
                  <p className="text-xs font-semibold text-[rgba(23,49,60,0.48)]">
                    위도 {place.lat.toFixed(5)} · 경도 {place.lng.toFixed(5)}
                  </p>
                  {nearbyAnchor ? (
                    <p className="inline-flex rounded-full bg-[rgba(15,118,110,0.1)] px-3 py-2 text-xs font-semibold text-tide">
                      기준 위치에서 {getDistanceLabel(nearbyAnchor, place)}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    className="secondary-link px-4 py-2 text-xs"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectPlace(place);
                    }}
                  >
                    지도 포커스
                  </button>
                  {actionLabel && onAction ? (
                    <button
                      className="primary-link px-4 py-2 text-xs"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAction(place);
                      }}
                    >
                      {actionLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
