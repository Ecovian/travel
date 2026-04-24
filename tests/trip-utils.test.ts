import { describe, expect, it } from "vitest";
import {
  addPlaceToTripDay,
  buildTripDays,
  createTrip,
  moveTripItem,
  updateTripItemMemo,
} from "@/lib/trip-utils";
import type { PlaceSummary } from "@/lib/types";

const firstPlace: PlaceSummary = {
  id: "place-1",
  name: "첫 장소",
  category: "관광명소",
  address: "서울 어딘가",
  lat: 37.5665,
  lng: 126.978,
};

const secondPlace: PlaceSummary = {
  id: "place-2",
  name: "둘째 장소",
  category: "카페",
  address: "서울 다른 곳",
  lat: 37.565,
  lng: 126.99,
};

describe("trip utils", () => {
  it("builds inclusive day buckets from the selected date range", () => {
    const days = buildTripDays("2026-04-23", "2026-04-25");

    expect(days).toHaveLength(3);
    expect(days[0].date).toBe("2026-04-23");
    expect(days[2].date).toBe("2026-04-25");
    expect(days[0].label.startsWith("Day 1")).toBe(true);
    expect(days[2].label.startsWith("Day 3")).toBe(true);
  });

  it("adds places, keeps order stable, and stores memo updates", () => {
    const trip = createTrip({
      title: "서울 주말 여행",
      destination: "서울",
      startDate: "2026-04-23",
      endDate: "2026-04-24",
    });

    const withFirstStop = addPlaceToTripDay(trip, 0, firstPlace);
    const withSecondStop = addPlaceToTripDay(withFirstStop, 0, secondPlace);
    const moved = moveTripItem(withSecondStop, 0, withSecondStop.days[0].items[1].id, "up");
    const noted = updateTripItemMemo(moved, 0, moved.days[0].items[0].id, "오픈 시간 확인");

    expect(moved.days[0].items[0].name).toBe("둘째 장소");
    expect(moved.days[0].items[1].name).toBe("첫 장소");
    expect(moved.days[0].items[0].order).toBe(0);
    expect(moved.days[0].items[1].order).toBe(1);
    expect(noted.days[0].items[0].memo).toBe("오픈 시간 확인");
  });
});
