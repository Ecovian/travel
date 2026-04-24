import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Trip } from "@/lib/types";

export type SharedTripRecord = {
  id: string;
  trip: Trip;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "shared-trips.json");

function isTrip(value: unknown): value is Trip {
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

async function readRecords() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, SharedTripRecord>;

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeRecords(records: Record<string, SharedTripRecord>) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

function createShareId() {
  return crypto.randomUUID().slice(0, 8);
}

export async function createSharedTrip(trip: unknown) {
  if (!isTrip(trip)) {
    throw new Error("공유할 여행 데이터가 올바르지 않습니다.");
  }

  const records = await readRecords();
  let id = createShareId();

  while (records[id]) {
    id = createShareId();
  }

  const now = new Date().toISOString();
  const record: SharedTripRecord = {
    id,
    trip,
    createdAt: now,
    updatedAt: now,
  };

  records[id] = record;
  await writeRecords(records);

  return record;
}

export async function getSharedTrip(id: string) {
  const records = await readRecords();

  return records[id];
}

export async function updateSharedTrip(id: string, trip: unknown) {
  if (!isTrip(trip)) {
    throw new Error("수정할 여행 데이터가 올바르지 않습니다.");
  }

  const records = await readRecords();
  const existing = records[id];

  if (!existing) {
    return undefined;
  }

  const record: SharedTripRecord = {
    ...existing,
    trip,
    updatedAt: new Date().toISOString(),
  };

  records[id] = record;
  await writeRecords(records);

  return record;
}
