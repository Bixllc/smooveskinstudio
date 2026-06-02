import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { fromZonedTime } from "date-fns-tz";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blockedTimes = await prisma.blockedTime.findMany({
    where: { clientId: session.clientId },
    orderBy: { startTimeUtc: "asc" },
  });

  return NextResponse.json(blockedTimes);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, startTime, endTime, reason } = body;

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "date, startTime, and endTime are required" }, { status: 400 });
  }

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });

  const timezone = settings?.timezone ?? "America/Chicago";

  const startTimeUtc = fromZonedTime(new Date(`${date}T${startTime}`), timezone);
  const endTimeUtc = fromZonedTime(new Date(`${date}T${endTime}`), timezone);

  if (endTimeUtc <= startTimeUtc) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const blocked = await prisma.blockedTime.create({
    data: {
      clientId: session.clientId,
      startTimeUtc,
      endTimeUtc,
      reason: reason || null,
    },
  });

  return NextResponse.json(blocked, { status: 201 });
}
