import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { token, action } = await request.json();

    if (!token || !action) {
      return NextResponse.json({ error: "token and action are required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { manageToken: token },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    if (action === "cancel") {
      // Allow cancellation only if booking is CONFIRMED or PENDING_PAYMENT
      if (!["CONFIRMED", "PENDING_PAYMENT"].includes(booking.status)) {
        return NextResponse.json(
          { error: "This booking cannot be cancelled" },
          { status: 400 }
        );
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing booking:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
