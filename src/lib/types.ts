export type TripItem = {
  id: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  memo?: string;
  order: number;
};

export type TripDay = {
  date: string;
  label: string;
  items: TripItem[];
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  days: TripDay[];
};

export type PlaceSummary = {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  thumbnail?: string;
};

export type NearbyCategory = "food" | "cafe";

export type StoredTrips = {
  trips: Trip[];
  recentTripId?: string;
};

export type TripDraft = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
};

export type MapMarker = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  tone?: "search" | "plan" | "active";
};

export type RouteSummary = {
  coordinates: Array<{
    lat: number;
    lng: number;
  }>;
  distanceMeters: number;
  durationSeconds: number;
};

export type PlaceSearchStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";
