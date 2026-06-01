import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "30");

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const since = subDays(new Date(), days);

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.clientId,
      startTimeUtc: { gte: since },
      status: { notIn: ["PENDING_PAYMENT"] },
    },
    include: {
      service: {
        select: {
          name: true,
          price: true,
          category: { select: { name: true } },
        },
      },
      customer: { select: { id: true } },
    },
  });

  const revenueByMonth: Record<string, number> = {};
  const serviceCount: Record<string, number> = {};
  const dayCount: Record<string, number> = {};
  let confirmedCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  const seenCustomers = new Set<string>();
  const returningCustomers = new Set<string>();

  for (const b of bookings) {
    const local = toZonedTime(b.startTimeUtc, tz);

    if (["CONFIRMED", "COMPLETED"].includes(b.status)) {
      const month = format(local, "MMM yy");
      revenueByMonth[month] = (revenueByMonth[month] ?? 0) + Number(b.service.price);
      serviceCount[b.service.name] = (serviceCount[b.service.name] ?? 0) + 1;

      const dow = format(local, "EEE");
      dayCount[dow] = (dayCount[dow] ?? 0) + 1;

      confirmedCount++;
      if (seenCustomers.has(b.customer.id)) {
        returningCustomers.add(b.customer.id);
      }
      seenCustomers.add(b.customer.id);
    }
    if (b.status === "CANCELLED") cancelledCount++;
    if (b.status === "NO_SHOW") noShowCount++;
  }

  const total = confirmedCount + cancelledCount + noShowCount;
  const noShowRate =
    total > 0 ? Math.round((noShowCount / total) * 100) : 0;
  const cancellationRate =
    total > 0 ? Math.round((cancelledCount / total) * 100) : 0;

  return NextResponse.json({
    revenueByMonth: Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6),
    topServices: Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
    byDay: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({
      day: d,
      count: dayCount[d] ?? 0,
    })),
    noShowRate,
    cancellationRate,
    totalRevenue: Object.values(revenueByMonth).reduce((a, b) => a + b, 0),
    newClients: seenCustomers.size - returningCustomers.size,
    returningClients: returningCustomers.size,
  });
}
