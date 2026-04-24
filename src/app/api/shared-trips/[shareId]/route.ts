import { NextResponse } from "next/server";
import { getSharedTrip, updateSharedTrip } from "@/lib/shared-trip-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { shareId } = await context.params;
    const record = await getSharedTrip(shareId);

    if (!record) {
      return NextResponse.json({ message: "공유 여행을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "공유 여행을 불러오지 못했습니다.";

    return NextResponse.json(
      {
        message,
      },
      { status: message.includes("공유 DB") ? 503 : 400 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { shareId } = await context.params;
    const body = (await request.json()) as { trip?: unknown };
    const record = await updateSharedTrip(shareId, body.trip);

    if (!record) {
      return NextResponse.json({ message: "공유 여행을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "공유 여행을 저장하지 못했습니다.";

    return NextResponse.json(
      {
        message,
      },
      { status: message.includes("공유 DB") ? 503 : 400 },
    );
  }
}
