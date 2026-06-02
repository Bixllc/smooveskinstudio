import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { sendAdminNotificationEmail } from "@/lib/email";

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
        service: { select: { durationMinutes: true, name: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
        client: {
          select: {
            id: true,
            businessSettings: {
              select: {
                allowClientCancel: true,
                allowClientReschedule: true,
                cancelRescheduleWindowHours: true,
                alertCancellation: true,
                alertReschedule: true,
                email: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const biz = booking.client.businessSettings;
    const windowHours = biz?.cancelRescheduleWindowHours ?? 24;
    const hoursUntilAppointment = (booking.startTimeUtc.getTime() - Date.now()) / (1000 * 60 * 60);

    if (action === "cancel") {
      if (biz?.allowClientCancel === false) {
        return NextResponse.json({ error: "Cancellations are not allowed online" }, { status: 400 });
      }

      if (hoursUntilAppointment < windowHours) {
        return NextResponse.json(
          { error: `Cannot cancel within ${windowHours} hours of appointment` },
          { status: 400 }
        );
      }

      if (!["CONFIRMED", "PENDING_PAYMENT"].includes(booking.status)) {
        return NextResponse.json({ error: "This booking cannot be cancelled" }, { status: 400 });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      // Send admin cancellation notification
      try {
        if (biz?.email && biz.alertCancellation !== false) {
          const tz = biz.timezone ?? "America/Chicago";
          const zonedStart = toZonedTime(booking.startTimeUtc, tz);
          const dateTimeStr = format(zonedStart, "EEEE, MMMM d, yyyy 'at' h:mm a");
          await sendAdminNotificationEmail({
            adminEmail: biz.email,
            customerName: booking.customer.fullName,
            customerEmail: booking.customer.email,
            customerPhone: booking.customer.phone ?? undefined,
            serviceName: booking.service.name,
            dateTime: `CANCELLED — ${dateTimeStr}`,
            bookingId: booking.id,
          });
        }
      } catch {}

      return NextResponse.json({ success: true });
    }

    if (action === "reschedule") {
      if (!newStartTimeUtc || typeof newStartTimeUtc !== "string") {
        return NextResponse.json({ error: "newStartTimeUtc is required" }, { status: 400 });
      }

      if (biz?.allowClientReschedule === false) {
        return NextResponse.json({ error: "Rescheduling is not allowed online" }, { status: 400 });
      }

      if (hoursUntilAppointment < windowHours) {
        return NextResponse.json(
          { error: `Cannot reschedule within ${windowHours} hours of appointment` },
          { status: 400 }
        );
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

      // Send admin reschedule notification
      try {
        if (biz?.email && biz.alertReschedule !== false) {
          const tz = biz.timezone ?? "America/Chicago";
          const zonedNew = toZonedTime(newStart, tz);
          const dateTimeStr = format(zonedNew, "EEEE, MMMM d, yyyy 'at' h:mm a");
          await sendAdminNotificationEmail({
            adminEmail: biz.email,
            customerName: booking.customer.fullName,
            customerEmail: booking.customer.email,
            customerPhone: booking.customer.phone ?? undefined,
            serviceName: booking.service.name,
            dateTime: `RESCHEDULED TO — ${dateTimeStr}`,
            bookingId: booking.id,
          });
        }
      } catch {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing booking:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
