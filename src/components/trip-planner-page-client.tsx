"use client";

import Link from "next/link";
import { useState } from "react";
import { useTrips } from "@/hooks/use-trips";
import type { Trip } from "@/lib/types";
import { TripWorkspace } from "@/components/trip-workspace";

type TripPlannerPageClientProps = {
  tripId: string;
};

export function TripPlannerPageClient({ tripId }: TripPlannerPageClientProps) {
  const { hydrated, findTrip, saveTrip, setRecentTrip } = useTrips();
  const trip = findTrip(tripId);
  const [shareUrl, setShareUrl] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "creating" | "ready" | "error">("idle");
  const [shareErrorMessage, setShareErrorMessage] = useState("");

  const createShareLink = async (currentTrip: Trip) => {
    setShareStatus("creating");
    setShareErrorMessage("");

    try {
      const response = await fetch("/api/shared-trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trip: currentTrip }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => undefined)) as { message?: string } | undefined;

        throw new Error(payload?.message || "공유 링크를 만들지 못했습니다.");
      }

      const record = (await response.json()) as { id: string };
      const nextShareUrl = `${window.location.origin}/share/${record.id}`;

      setShareUrl(nextShareUrl);
      setShareStatus("ready");
      await navigator.clipboard?.writeText(nextShareUrl).catch(() => undefined);
    } catch (error) {
      setShareStatus("error");
      setShareErrorMessage(error instanceof Error ? error.message : "공유 링크를 만들지 못했습니다.");
    }
  };

  if (!hydrated) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">여행 데이터를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">해당 여행을 찾을 수 없습니다.</p>
        <p className="mt-3 max-w-md text-sm leading-7 text-[rgba(23,49,60,0.62)]">
          브라우저 저장소에 없는 일정이거나 이미 삭제된 여행입니다.
        </p>
        <Link className="primary-link mt-5" href="/planner">
          일정 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <TripWorkspace
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="primary-link px-4 py-2 text-xs"
            disabled={shareStatus === "creating"}
            type="button"
            onClick={() => {
              void createShareLink(trip);
            }}
          >
            {shareStatus === "creating" ? "공유 링크 생성 중" : "공유 링크 만들기"}
          </button>
          {shareUrl ? (
            <a className="secondary-link px-4 py-2 text-xs" href={shareUrl}>
              공유 플래너 열기
            </a>
          ) : null}
          {shareStatus === "ready" ? (
            <span className="rounded-full bg-[rgba(15,118,110,0.1)] px-3 py-2 text-xs font-semibold text-tide">
              링크 복사됨
            </span>
          ) : null}
          {shareStatus === "error" ? (
            <span
              className="rounded-full bg-[rgba(255,134,71,0.14)] px-3 py-2 text-xs font-semibold text-[rgba(146,75,35,0.92)]"
              title={shareErrorMessage}
            >
              {shareErrorMessage || "공유 실패"}
            </span>
          ) : null}
        </div>
      }
      backHref="/planner"
      backLabel="목록으로"
      onSaveTrip={(nextTrip) => {
        saveTrip(nextTrip);
        setRecentTrip(nextTrip.id);
      }}
      trip={trip}
    />
  );
}
