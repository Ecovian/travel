"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/types";
import { TripWorkspace } from "@/components/trip-workspace";

type SharedTripRecord = {
  id: string;
  trip: Trip;
  updatedAt: string;
};

type SharedTripPageClientProps = {
  shareId: string;
};

export function SharedTripPageClient({ shareId }: SharedTripPageClientProps) {
  const [trip, setTrip] = useState<Trip>();
  const [updatedAt, setUpdatedAt] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const savingRef = useRef(false);

  const loadSharedTrip = async ({ quiet = false } = {}) => {
    if (!quiet) {
      setStatus("loading");
    }

    try {
      const response = await fetch(`/api/shared-trips/${shareId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => undefined)) as { message?: string } | undefined;

        throw new Error(payload?.message || "공유 여행을 찾을 수 없습니다.");
      }

      const record = (await response.json()) as SharedTripRecord;
      setTrip(record.trip);
      setUpdatedAt(record.updatedAt);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "공유 여행을 불러오지 못했습니다.");
    }
  };

  const saveSharedTrip = async (nextTrip: Trip) => {
    setTrip(nextTrip);
    setStatus("saving");
    savingRef.current = true;

    try {
      const response = await fetch(`/api/shared-trips/${shareId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trip: nextTrip }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => undefined)) as { message?: string } | undefined;

        throw new Error(payload?.message || "공유 여행을 저장하지 못했습니다.");
      }

      const record = (await response.json()) as SharedTripRecord;
      setTrip(record.trip);
      setUpdatedAt(record.updatedAt);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "공유 여행을 저장하지 못했습니다.");
    } finally {
      savingRef.current = false;
    }
  };

  useEffect(() => {
    void loadSharedTrip();
  }, [shareId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!savingRef.current) {
        void loadSharedTrip({ quiet: true });
      }
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [shareId]);

  if (status === "loading" && !trip) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">공유 여행을 불러오는 중입니다.</p>
      </div>
    );
  }

  if (status === "error" && !trip) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">{errorMessage}</p>
        <Link className="primary-link mt-5" href="/planner">
          일정 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <TripWorkspace
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(15,118,110,0.1)] px-3 py-2 text-xs font-semibold text-tide">
            {status === "saving" ? "저장 중" : "공유 저장됨"}
          </span>
          <button
            className="secondary-link px-4 py-2 text-xs"
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(window.location.href);
            }}
          >
            현재 링크 복사
          </button>
          {updatedAt ? (
            <span className="rounded-full border border-[rgba(23,49,60,0.1)] bg-white/70 px-3 py-2 text-xs font-semibold text-[rgba(23,49,60,0.58)]">
              {new Date(updatedAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              동기화
            </span>
          ) : null}
        </div>
      }
      backHref="/planner"
      backLabel="내 일정으로"
      eyebrow="Shared trip board"
      onSaveTrip={(nextTrip) => {
        void saveSharedTrip(nextTrip);
      }}
      trip={trip}
    />
  );
}
