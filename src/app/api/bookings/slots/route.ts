import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, serviceId, date, addOnIds } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "date is required in YYYY-MM-DD format" }, { status: 400 });
    }

    // Compute total add-on duration
    let addOnDurationMinutes = 0;
    if (Array.isArray(addOnIds) && addOnIds.length > 0) {
      const addOns = await prisma.addOn.findMany({
        where: { id: { in: addOnIds }, clientId, active: true },
        select: { durationMinutes: true },
      });
      addOnDurationMinutes = addOns.reduce((sum, a) => sum + a.durationMinutes, 0);
    }

    const slots = await getAvailableSlots({ clientId, serviceId, date, addOnDurationMinutes });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
  }
}
