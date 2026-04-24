import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripInStorage,
  deleteTripFromStorage,
  readTripStorage,
  TRIP_STORAGE_KEY,
  writeTripStorage,
} from "@/lib/storage";

function createWindowMock() {
  const data = new Map<string, string>();

  return {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
      clear: () => {
        data.clear();
      },
    },
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

describe("storage helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("window", createWindowMock() as unknown as Window & typeof globalThis);
    vi.stubGlobal(
      "Event",
      class MockEvent {
        type: string;

        constructor(type: string) {
          this.type = type;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes and reads trips from localStorage", () => {
    const { storage } = createTripInStorage(
      { trips: [] },
      {
        title: "부산 바다 여행",
        destination: "부산",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
      },
    );

    writeTripStorage(storage);
    const saved = readTripStorage();

    expect(saved.trips).toHaveLength(1);
    expect(saved.recentTripId).toBe(saved.trips[0].id);
    expect(window.localStorage.getItem(TRIP_STORAGE_KEY)).toContain("부산 바다 여행");
    expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it("moves recentTripId when the latest trip is deleted", () => {
    const first = createTripInStorage(
      { trips: [] },
      {
        title: "도쿄 여행",
        destination: "도쿄",
        startDate: "2026-06-10",
        endDate: "2026-06-12",
      },
    );
    const second = createTripInStorage(first.storage, {
      title: "제주 여행",
      destination: "제주",
      startDate: "2026-07-01",
      endDate: "2026-07-04",
    });

    const nextStorage = deleteTripFromStorage(second.storage, second.trip.id);

    expect(nextStorage.trips).toHaveLength(1);
    expect(nextStorage.recentTripId).toBe(first.trip.id);
  });
});
