import { NextResponse } from "next/server";
import { createSharedTrip } from "@/lib/shared-trip-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { trip?: unknown };
    const record = await createSharedTrip(body.trip);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "공유 여행을 만들지 못했습니다.";

    return NextResponse.json(
      {
        message,
      },
      { status: message.includes("공유 DB") ? 503 : 400 },
    );
  }
}
