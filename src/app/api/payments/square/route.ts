import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chargeCard } from "@/lib/square";

export async function POST(request: NextRequest) {
  try {
    const { sourceId, bookingId } = await request.json();

    if (!sourceId || !bookingId) {
      return NextResponse.json(
        { error: "sourceId and bookingId are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { price: true, depositAmount: true, paymentType: true } },
        customer: { select: { email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Booking is not awaiting payment" },
        { status: 400 }
      );
    }

    const chargeAmount =
      booking.service.paymentType === "DEPOSIT" && booking.service.depositAmount
        ? Number(booking.service.depositAmount)
        : Number(booking.service.price);

    const { paymentId } = await chargeCard({
      sourceId,
      amountCents: Math.round(chargeAmount * 100),
      bookingId,
      customerEmail: booking.customer.email,
    });

    // Mark booking confirmed and create payment record
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentProvider: "square",
          paymentId,
        },
      }),
      prisma.payment.create({
        data: {
          clientId: booking.clientId,
          bookingId,
          provider: "square",
          providerPaymentId: paymentId,
          amount: chargeAmount,
          status: "PAID",
          paidAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Square charge error:", error);
    // Surface Square-specific errors to the client
    const message = error?.message?.includes("Square charge failed")
      ? "Your card was declined. Please check your details and try again."
      : "Payment failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
