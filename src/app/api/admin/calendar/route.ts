import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date") ?? new Date().toISOString();

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const localDate = toZonedTime(new Date(dateParam), tz);
  const weekStartLocal = startOfWeek(localDate, { weekStartsOn: 1 }); // Mon
  const weekEndLocal = endOfWeek(localDate, { weekStartsOn: 1 });

  const weekStartUtc = fromZonedTime(weekStartLocal, tz);
  const weekEndUtc = fromZonedTime(weekEndLocal, tz);

  const [bookings, blockedTimes] = await Promise.all([
    prisma.booking.findMany({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gte: weekStartUtc, lte: weekEndUtc },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        customer: { select: { fullName: true, email: true, phone: true } },
        service: {
          select: {
            name: true,
            durationMinutes: true,
            price: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { startTimeUtc: "asc" },
    }),

    prisma.blockedTime.findMany({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gte: weekStartUtc },
        endTimeUtc: { lte: weekEndUtc },
      },
    }),
  ]);

  return NextResponse.json({ bookings, blockedTimes, timezone: tz });
}
