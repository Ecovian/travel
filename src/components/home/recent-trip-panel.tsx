"use client";

import Link from "next/link";
import { useTrips } from "@/hooks/use-trips";
import { formatTripDateRange, getTripItemCount, getTripLength } from "@/lib/trip-utils";

export function RecentTripPanel() {
  const { hydrated, recentTrip } = useTrips();

  return (
    <aside className="surface-card relative overflow-hidden bg-hero-glow p-6 sm:p-8">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[rgba(255,134,71,0.16)] blur-3xl" />
      <div className="relative z-10">
        <p className="hero-badge">Continue planning</p>
        <h2 className="mt-4 text-3xl">최근 작업한 여행</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[rgba(23,49,60,0.68)]">
          같은 브라우저에 저장된 여행을 이어서 수정할 수 있습니다. 로그인 없이도 마지막으로 열었던
          일정이 자연스럽게 연결됩니다.
        </p>

        <div className="mt-6">
          {!hydrated ? (
            <div className="ghost-card p-6">
              <p className="text-sm text-[rgba(23,49,60,0.62)]">저장된 여행 정보를 불러오는 중입니다.</p>
            </div>
          ) : null}

          {hydrated && !recentTrip ? (
            <div className="ghost-card p-6">
              <p className="text-sm font-semibold text-[rgba(23,49,60,0.62)]">
                아직 저장된 여행이 없습니다.
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(23,49,60,0.62)]">
                첫 여행을 만들면 이 카드에서 바로 이어서 수정할 수 있습니다.
              </p>
              <Link className="primary-link mt-5" href="/planner">
                첫 일정 만들기
              </Link>
            </div>
          ) : null}

          {hydrated && recentTrip ? (
            <div className="rounded-[28px] border border-[rgba(23,49,60,0.12)] bg-white/72 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.48)]">
                recent trip
              </p>
              <h3 className="mt-3 text-3xl">{recentTrip.title}</h3>
              <p className="mt-2 text-sm font-semibold text-tide">{recentTrip.destination}</p>
              <p className="mt-3 text-sm text-[rgba(23,49,60,0.62)]">{formatTripDateRange(recentTrip)}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="mini-stat">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                    Day Count
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{getTripLength(recentTrip)}일</p>
                </div>
                <div className="mini-stat">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                    Saved Spots
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{getTripItemCount(recentTrip)}개</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="primary-link" href={`/planner/${recentTrip.id}`}>
                  이어서 편집
                </Link>
                <Link className="secondary-link" href="/explore">
                  장소 더 찾아보기
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
