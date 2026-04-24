import { createTrip } from "@/lib/trip-utils";
import type { StoredTrips, Trip, TripDraft } from "@/lib/types";

export const TRIP_STORAGE_KEY = "travel-tool-storage";
export const TRIP_STORAGE_EVENT = "travel-tool-storage-updated";

const EMPTY_STORAGE: StoredTrips = {
  trips: [],
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isTripRecord(value: unknown): value is Trip {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Trip;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.destination === "string" &&
    typeof candidate.startDate === "string" &&
    typeof candidate.endDate === "string" &&
    Array.isArray(candidate.days)
  );
}

function normalizeStorage(value: unknown): StoredTrips {
  if (!value || typeof value !== "object") {
    return EMPTY_STORAGE;
  }

  const candidate = value as Partial<StoredTrips>;
  const trips = Array.isArray(candidate.trips) ? candidate.trips.filter(isTripRecord) : [];

  return {
    trips,
    recentTripId: typeof candidate.recentTripId === "string" ? candidate.recentTripId : undefined,
  };
}

export function readTripStorage() {
  if (!isBrowser()) {
    return EMPTY_STORAGE;
  }

  try {
    const raw = window.localStorage.getItem(TRIP_STORAGE_KEY);

    if (!raw) {
      return EMPTY_STORAGE;
    }

    return normalizeStorage(JSON.parse(raw));
  } catch {
    return EMPTY_STORAGE;
  }
}

export function writeTripStorage(nextValue: StoredTrips) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(nextValue));
  window.dispatchEvent(new Event(TRIP_STORAGE_EVENT));
}

export function getTripById(storage: StoredTrips, tripId: string) {
  return storage.trips.find((trip) => trip.id === tripId);
}

export function upsertTrip(storage: StoredTrips, trip: Trip): StoredTrips {
  const trips = [trip, ...storage.trips.filter((item) => item.id !== trip.id)];

  return {
    trips,
    recentTripId: trip.id,
  };
}

export function createTripInStorage(storage: StoredTrips, draft: TripDraft) {
  const trip = createTrip(draft);

  return {
    storage: upsertTrip(storage, trip),
    trip,
  };
}

export function deleteTripFromStorage(storage: StoredTrips, tripId: string): StoredTrips {
  const trips = storage.trips.filter((trip) => trip.id !== tripId);

  return {
    trips,
    recentTripId: storage.recentTripId === tripId ? trips[0]?.id : storage.recentTripId,
  };
}

export function setRecentTripId(storage: StoredTrips, tripId: string): StoredTrips {
  return {
    ...storage,
    recentTripId: tripId,
  };
}
