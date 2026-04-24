"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "@/hooks/use-trips";
import { featuredDestinations } from "@/lib/mock-data";
import { formatTripDateRange, getInputDateValue, getTripItemCount, getTripLength } from "@/lib/trip-utils";

type PlannerFormState = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
};

const DEFAULT_FORM: PlannerFormState = {
  title: "",
  destination: "",
  startDate: getInputDateValue(0),
  endDate: getInputDateValue(2),
};

const DESTINATION_SUGGESTIONS = featuredDestinations.map((destination) => destination.title.split(" ")[0]);

export function PlannerListPageClient() {
  const router = useRouter();
  const { trips, recentTripId, createTrip, deleteTrip, setRecentTrip } = useTrips();
  const [form, setForm] = useState<PlannerFormState>(DEFAULT_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateTrip = () => {
    if (!form.title.trim() || !form.destination.trim()) {
      setErrorMessage("여행 제목과 목적지를 먼저 입력해 주세요.");
      return;
    }

    if (form.endDate < form.startDate) {
      setErrorMessage("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    const trip = createTrip(form);

    if (!trip) {
      setErrorMessage("여행을 저장하지 못했습니다.");
      return;
    }

    setErrorMessage("");
    setForm(DEFAULT_FORM);
    router.push(`/planner/${trip.id}`);
  };

  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[0.96fr_1.04fr]">
          <div className="space-y-5">
            <span className="hero-badge">Trip planner list</span>
            <h1 className="section-title max-w-3xl">
              날짜를 정하면 Day 섹션이 만들어지고, 바로 장소를 담을 수 있습니다.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgba(23,49,60,0.72)] sm:text-lg">
              새 여행을 만들고 상세 플래너로 이동하면 장소 검색, 일정표, 지도를 동시에 보며 여행 동선을
              빠르게 정리할 수 있습니다.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                  Saved Trips
                </p>
                <p className="mt-3 text-3xl font-semibold">{trips.length}</p>
              </article>
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                  Recent Trip
                </p>
                <p className="mt-3 text-xl font-semibold">
                  {trips.find((trip) => trip.id === recentTripId)?.title ?? "아직 없음"}
                </p>
              </article>
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.42)]">
                  Persistence
                </p>
                <p className="mt-3 text-xl font-semibold">localStorage</p>
              </article>
            </div>
          </div>

          <div className="surface-card border border-[rgba(23,49,60,0.1)] bg-white/58 p-5 sm:p-6">
            <p className="hero-badge">New trip</p>
            <h2 className="mt-4 text-2xl">새 여행 만들기</h2>
            <p className="mt-3 text-sm leading-7 text-[rgba(23,49,60,0.66)]">
              제목, 목적지, 시작일과 종료일만 정하면 Day 1/2/3 형태의 일정판이 자동 생성됩니다.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="field-label" htmlFor="trip-title">
                  여행 제목
                </label>
                <input
                  id="trip-title"
                  className="field-input"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="예: 6월 도쿄 미식 여행"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="trip-destination">
                  목적지
                </label>
                <input
                  id="trip-destination"
                  className="field-input"
                  value={form.destination}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, destination: event.target.value }))
                  }
                  placeholder="예: 도쿄, 제주, 오사카"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {DESTINATION_SUGGESTIONS.map((destination) => (
                  <button
                    key={destination}
                    className="chip-button"
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        destination,
                        title: current.title || `${destination} 여행`,
                      }))
                    }
                  >
                    {destination}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="trip-start-date">
                    시작일
                  </label>
                  <input
                    id="trip-start-date"
                    className="field-input"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startDate: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="trip-end-date">
                    종료일
                  </label>
                  <input
                    id="trip-end-date"
                    className="field-input"
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, endDate: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-[18px] border border-[rgba(255,134,71,0.3)] bg-[rgba(255,134,71,0.1)] px-4 py-3 text-sm text-[rgba(123,44,13,0.9)]">
                {errorMessage}
              </div>
            ) : null}

            <button className="primary-link mt-5 w-full justify-center" type="button" onClick={handleCreateTrip}>
              일정 보드 만들기
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="hero-badge">Saved itineraries</p>
            <h2 className="mt-4 text-3xl">저장된 여행 목록</h2>
          </div>
          <p className="text-sm text-[rgba(23,49,60,0.62)]">
            같은 브라우저에 저장되며, 가장 최근에 수정한 여행이 위에 표시됩니다.
          </p>
        </div>

        {trips.length ? (
          <div className="mt-6 grid gap-4">
            {trips.map((trip) => (
              <article key={trip.id} className="rounded-[26px] border border-[rgba(23,49,60,0.1)] bg-white/62 p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl">{trip.title}</h3>
                      {trip.id === recentTripId ? (
                        <span className="rounded-full bg-[rgba(15,118,110,0.12)] px-3 py-1 text-xs font-semibold text-tide">
                          최근 작업
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-semibold text-tide">{trip.destination}</p>
                    <p className="text-sm text-[rgba(23,49,60,0.64)]">{formatTripDateRange(trip)}</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-[rgba(23,49,60,0.06)] px-3 py-2 text-xs font-semibold text-[rgba(23,49,60,0.72)]">
                        {getTripLength(trip)}일 일정
                      </span>
                      <span className="rounded-full bg-[rgba(255,134,71,0.12)] px-3 py-2 text-xs font-semibold text-[rgba(146,75,35,0.92)]">
                        장소 {getTripItemCount(trip)}개
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="primary-link"
                      type="button"
                      onClick={() => {
                        setRecentTrip(trip.id);
                        router.push(`/planner/${trip.id}`);
                      }}
                    >
                      상세 플래너 열기
                    </button>
                    <button
                      className="secondary-link"
                      type="button"
                      onClick={() => {
                        if (window.confirm(`"${trip.title}" 여행을 삭제할까요?`)) {
                          deleteTrip(trip.id);
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-6">
            <p className="text-lg font-semibold">아직 저장된 여행이 없습니다.</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-[rgba(23,49,60,0.62)]">
              위의 폼에서 첫 여행을 만들면 날짜별 Day 보드가 생성되고 상세 플래너로 바로 이동합니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
