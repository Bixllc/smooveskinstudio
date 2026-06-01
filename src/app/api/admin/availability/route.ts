import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.availabilityRule.findMany({
    where: { clientId: session.clientId },
    orderBy: { dayOfWeek: "asc" },
  });

  const result = Array.from({ length: 7 }, (_, i) => {
    const rule = rules.find((r) => r.dayOfWeek === i);
    return {
      dayOfWeek: i,
      dayName: DAY_NAMES[i],
      active: rule?.active ?? false,
      startTime: rule?.startTime ?? "09:00",
      endTime: rule?.endTime ?? "17:00",
    };
  });

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Array<{
    dayOfWeek: number;
    active: boolean;
    startTime: string;
    endTime: string;
  }> = await req.json();

  for (const day of body) {
    await prisma.availabilityRule.upsert({
      where: { id: `avail-day-${day.dayOfWeek}` },
      update: {
        active: day.active,
        startTime: day.startTime,
        endTime: day.endTime,
      },
      create: {
        id: `avail-day-${day.dayOfWeek}`,
        clientId: session.clientId,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        active: day.active,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
