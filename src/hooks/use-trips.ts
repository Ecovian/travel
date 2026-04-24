"use client";

import { useEffect, useState } from "react";
import {
  createTripInStorage,
  deleteTripFromStorage,
  getTripById,
  readTripStorage,
  setRecentTripId,
  TRIP_STORAGE_EVENT,
  upsertTrip,
  writeTripStorage,
} from "@/lib/storage";
import type { StoredTrips, Trip, TripDraft } from "@/lib/types";

const EMPTY_TRIP_SNAPSHOT: StoredTrips = {
  trips: [],
};

export function useTrips() {
  const [snapshot, setSnapshot] = useState<StoredTrips>(EMPTY_TRIP_SNAPSHOT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSnapshot(readTripStorage());
    };

    sync();
    setHydrated(true);
    window.addEventListener("storage", sync);
    window.addEventListener(TRIP_STORAGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TRIP_STORAGE_EVENT, sync);
    };
  }, []);

  const commit = (updater: (current: StoredTrips) => StoredTrips) => {
    const next = updater(readTripStorage());
    writeTripStorage(next);
    setSnapshot(next);
    return next;
  };

  return {
    hydrated,
    trips: snapshot.trips,
    recentTripId: snapshot.recentTripId,
    recentTrip: snapshot.recentTripId ? getTripById(snapshot, snapshot.recentTripId) : undefined,
    findTrip: (tripId: string) => getTripById(snapshot, tripId),
    createTrip: (draft: TripDraft) => {
      let created: Trip | undefined;
      commit((current) => {
        const result = createTripInStorage(current, draft);
        created = result.trip;
        return result.storage;
      });

      return created;
    },
    saveTrip: (trip: Trip) => {
      commit((current) => upsertTrip(current, trip));
      return trip;
    },
    deleteTrip: (tripId: string) => {
      commit((current) => deleteTripFromStorage(current, tripId));
    },
    setRecentTrip: (tripId: string) => {
      commit((current) => setRecentTripId(current, tripId));
    },
  };
}
