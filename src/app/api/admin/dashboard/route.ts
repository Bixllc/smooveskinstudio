import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const nowUtc = new Date();
  const nowLocal = toZonedTime(nowUtc, tz);
  const todayStart = fromZonedTime(startOfDay(nowLocal), tz);
  const todayEnd = fromZonedTime(endOfDay(nowLocal), tz);
  const monthStart = fromZonedTime(startOfMonth(nowLocal), tz);
  const monthEnd = fromZonedTime(endOfMonth(nowLocal), tz);

  const [todayBookings, monthBookings, nextAppt, last30Bookings, cancellations, noShows] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gte: todayStart, lte: todayEnd },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        include: {
          customer: { select: { fullName: true } },
          service: {
            select: {
              name: true,
              price: true,
              durationMinutes: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { startTimeUtc: "asc" },
      }),

      prisma.booking.findMany({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gte: monthStart, lte: monthEnd },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        include: { service: { select: { price: true } } },
      }),

      prisma.booking.findFirst({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gt: nowUtc },
          status: "CONFIRMED",
        },
        include: {
          customer: { select: { fullName: true } },
          service: {
            select: {
              name: true,
              durationMinutes: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { startTimeUtc: "asc" },
      }),

      prisma.booking.findMany({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gte: subDays(nowUtc, 30) },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: {
          startTimeUtc: true,
          service: { select: { price: true } },
        },
      }),

      prisma.booking.count({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gte: monthStart },
          status: "CANCELLED",
        },
      }),

      prisma.booking.count({
        where: {
          clientId: session.clientId,
          startTimeUtc: { gte: monthStart },
          status: "NO_SHOW",
        },
      }),
    ]);

  const todayRevenue = todayBookings.reduce(
    (s, b) => s + Number(b.service.price),
    0
  );
  const mtdRevenue = monthBookings.reduce(
    (s, b) => s + Number(b.service.price),
    0
  );

  // Daily sparkline for last 30 days
  const dailyMap: Record<string, number> = {};
  for (const b of last30Bookings) {
    const day = toZonedTime(b.startTimeUtc, tz).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + Number(b.service.price);
  }
  const sparkline = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(nowUtc, 29 - i);
    const key = toZonedTime(d, tz).toISOString().slice(0, 10);
    return { date: key, revenue: dailyMap[key] ?? 0 };
  });

  return NextResponse.json({
    todayBookings,
    todayRevenue,
    mtdRevenue,
    monthBookingCount: monthBookings.length,
    cancellations,
    noShows,
    nextAppt,
    sparkline,
    timezone: tz,
  });
}
