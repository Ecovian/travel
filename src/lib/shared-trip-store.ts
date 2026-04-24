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
const REDIS_KEY_PREFIX = "travel-tool:shared-trip:";

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

type RedisConfig = {
  restUrl: string;
  token: string;
};

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

function getRedisConfig(): RedisConfig | undefined {
  const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restUrl || !token) {
    return undefined;
  }

  return {
    restUrl,
    token,
  };
}

function shouldUseRedis() {
  return Boolean(getRedisConfig());
}

function isHostedRuntime() {
  return Boolean(process.env.VERCEL);
}

function getShareKey(id: string) {
  return `${REDIS_KEY_PREFIX}${id}`;
}

async function runRedisCommand<T>(command: Array<string | number>) {
  const config = getRedisConfig();

  if (!config) {
    throw new Error(
      "공유 DB가 연결되어 있지 않습니다. Vercel Marketplace에서 Upstash Redis를 추가하고 환경변수를 연결해 주세요.",
    );
  }

  const response = await fetch(config.restUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("공유 DB 요청에 실패했습니다.");
  }

  const payload = (await response.json()) as RedisResponse<T>;

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

async function getSharedTripFromRedis(id: string) {
  const raw = await runRedisCommand<string | null>(["GET", getShareKey(id)]);

  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw) as SharedTripRecord;

  return parsed && parsed.id === id ? parsed : undefined;
}

async function setSharedTripInRedis(record: SharedTripRecord) {
  await runRedisCommand<string>(["SET", getShareKey(record.id), JSON.stringify(record)]);
}

function assertWritableStore() {
  if (!shouldUseRedis() && isHostedRuntime()) {
    throw new Error(
      "공유 DB가 연결되어 있지 않습니다. Vercel Marketplace에서 Upstash Redis를 추가한 뒤 다시 배포해 주세요.",
    );
  }
}

export async function createSharedTrip(trip: unknown) {
  if (!isTrip(trip)) {
    throw new Error("공유할 여행 데이터가 올바르지 않습니다.");
  }

  assertWritableStore();

  if (shouldUseRedis()) {
    let id = createShareId();

    while (await getSharedTripFromRedis(id)) {
      id = createShareId();
    }

    const now = new Date().toISOString();
    const record: SharedTripRecord = {
      id,
      trip,
      createdAt: now,
      updatedAt: now,
    };

    await setSharedTripInRedis(record);

    return record;
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
  assertWritableStore();

  if (shouldUseRedis()) {
    return getSharedTripFromRedis(id);
  }

  const records = await readRecords();

  return records[id];
}

export async function updateSharedTrip(id: string, trip: unknown) {
  if (!isTrip(trip)) {
    throw new Error("수정할 여행 데이터가 올바르지 않습니다.");
  }

  assertWritableStore();

  if (shouldUseRedis()) {
    const existing = await getSharedTripFromRedis(id);

    if (!existing) {
      return undefined;
    }

    const record: SharedTripRecord = {
      ...existing,
      trip,
      updatedAt: new Date().toISOString(),
    };

    await setSharedTripInRedis(record);

    return record;
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
