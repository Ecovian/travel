import type { PlaceSummary, Trip, TripDay, TripDraft, TripItem } from "@/lib/types";

const FALLBACK_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getDateAtLocalMidnight(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function enumerateTripDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = getDateAtLocalMidnight(startDate);
  const end = getDateAtLocalMidnight(endDate);

  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime()) || cursor > end) {
    return dates;
  }

  while (cursor <= end) {
    dates.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function buildTripDays(startDate: string, endDate: string): TripDay[] {
  return enumerateTripDates(startDate, endDate).map((date, index) => ({
    date,
    label: `Day ${index + 1} · ${FALLBACK_WEEKDAY_FORMATTER.format(getDateAtLocalMidnight(date))}`,
    items: [],
  }));
}

export function createTrip(draft: TripDraft): Trip {
  return {
    id: createId("trip"),
    title: draft.title.trim(),
    destination: draft.destination.trim(),
    startDate: draft.startDate,
    endDate: draft.endDate,
    coverImage: draft.coverImage,
    days: buildTripDays(draft.startDate, draft.endDate),
  };
}

export function formatTripDateRange(trip: Pick<Trip, "startDate" | "endDate">) {
  const start = FALLBACK_WEEKDAY_FORMATTER.format(getDateAtLocalMidnight(trip.startDate));
  const end = FALLBACK_WEEKDAY_FORMATTER.format(getDateAtLocalMidnight(trip.endDate));

  return `${start} - ${end}`;
}

export function getTripLength(trip: Pick<Trip, "days">) {
  return trip.days.length;
}

export function getTripItemCount(trip: Pick<Trip, "days">) {
  return trip.days.reduce((count, day) => count + day.items.length, 0);
}

export function getInputDateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateKey(date);
}

function withUpdatedDay(trip: Trip, dayIndex: number, updater: (day: TripDay) => TripDay) {
  return {
    ...trip,
    days: trip.days.map((day, index) => (index === dayIndex ? updater(day) : day)),
  };
}

function reindexItems(items: TripItem[]) {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function addPlaceToTripDay(trip: Trip, dayIndex: number, place: PlaceSummary) {
  return withUpdatedDay(trip, dayIndex, (day) => {
    const nextItems = reindexItems([
      ...day.items,
      {
        id: createId("item"),
        placeId: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        order: day.items.length,
      },
    ]);

    return {
      ...day,
      items: nextItems,
    };
  });
}

export function removeTripItem(trip: Trip, dayIndex: number, itemId: string) {
  return withUpdatedDay(trip, dayIndex, (day) => ({
    ...day,
    items: reindexItems(day.items.filter((item) => item.id !== itemId)),
  }));
}

export function moveTripItem(trip: Trip, dayIndex: number, itemId: string, direction: "up" | "down") {
  return withUpdatedDay(trip, dayIndex, (day) => {
    const index = day.items.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return day;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= day.items.length) {
      return day;
    }

    const nextItems = [...day.items];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(targetIndex, 0, item);

    return {
      ...day,
      items: reindexItems(nextItems),
    };
  });
}

export function updateTripItemMemo(trip: Trip, dayIndex: number, itemId: string, memo: string) {
  return withUpdatedDay(trip, dayIndex, (day) => ({
    ...day,
    items: day.items.map((item) => (item.id === itemId ? { ...item, memo } : item)),
  }));
}
