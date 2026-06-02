import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { addMinutes } from "date-fns";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      customer: { select: { fullName: true, email: true } },
      client: {
        select: {
          id: true,
          slug: true,
          businessSettings: { select: { timezone: true, address: true, cancellationPolicy: true } },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, newStartTimeUtc } = body;

    if (!token || !action) {
      return NextResponse.json({ error: "token and action are required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { manageToken: token },
      include: {
        service: { select: { durationMinutes: true } },
        client: { select: { id: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    if (action === "cancel") {
      if (!["CONFIRMED", "PENDING_PAYMENT"].includes(booking.status)) {
        return NextResponse.json({ error: "This booking cannot be cancelled" }, { status: 400 });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "reschedule") {
      if (!newStartTimeUtc || typeof newStartTimeUtc !== "string") {
        return NextResponse.json({ error: "newStartTimeUtc is required" }, { status: 400 });
      }

      if (!["CONFIRMED", "PENDING_PAYMENT"].includes(booking.status)) {
        return NextResponse.json({ error: "This booking cannot be rescheduled" }, { status: 400 });
      }

      const newStart = new Date(newStartTimeUtc);
      if (isNaN(newStart.getTime())) {
        return NextResponse.json({ error: "Invalid newStartTimeUtc" }, { status: 400 });
      }

      const newEnd = addMinutes(newStart, booking.service.durationMinutes);

      // Check availability — temporarily exclude this booking from conflict check
      const available = await isSlotAvailable(
        { clientId: booking.clientId, serviceId: booking.serviceId, startTimeUtc: newStart },
        undefined,
        booking.id // exclude current booking
      );

      if (!available) {
        return NextResponse.json({ error: "That time slot is no longer available" }, { status: 409 });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          startTimeUtc: newStart,
          endTimeUtc: newEnd,
          status: "CONFIRMED",
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing booking:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
