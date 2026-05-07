import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId query parameter is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, clientId },
      include: {
        service: {
          select: {
            name: true,
            durationMinutes: true,
            price: true,
            description: true,
          },
        },
        customer: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: booking.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      startTimeUtc: booking.startTimeUtc.toISOString(),
      endTimeUtc: booking.endTimeUtc.toISOString(),
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      service: booking.service,
      customer: booking.customer,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
