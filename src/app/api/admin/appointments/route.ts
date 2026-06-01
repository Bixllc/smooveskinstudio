import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "upcoming"; // upcoming | past | cancelled
  const search = searchParams.get("search") ?? "";

  const now = new Date();

  const baseWhere: any = { clientId: session.clientId };

  if (tab === "upcoming") {
    baseWhere.startTimeUtc = { gte: now };
    baseWhere.status = { in: ["CONFIRMED", "PENDING_PAYMENT"] };
  } else if (tab === "past") {
    baseWhere.startTimeUtc = { lt: now };
    baseWhere.status = { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] };
  } else {
    baseWhere.status = "CANCELLED";
  }

  if (search) {
    baseWhere.customer = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [bookings, settings] = await Promise.all([
    prisma.booking.findMany({
      where: baseWhere,
      include: {
        customer: {
          select: { fullName: true, email: true, phone: true },
        },
        service: {
          select: {
            name: true,
            durationMinutes: true,
            price: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: {
        startTimeUtc: tab === "upcoming" ? "asc" : "desc",
      },
      take: 100,
    }),

    prisma.businessSettings.findUnique({
      where: { clientId: session.clientId },
      select: { timezone: true },
    }),
  ]);

  return NextResponse.json({
    bookings,
    timezone: settings?.timezone ?? "America/Chicago",
  });
}
