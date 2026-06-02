import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chargeCard } from "@/lib/square";
import { sendConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
        service: { select: { name: true, price: true, depositAmount: true, paymentType: true, durationMinutes: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
        client: {
          select: {
            businessSettings: {
              select: {
                email: true,
                timezone: true,
                address: true,
                cancellationPolicy: true,
                latePolicy: true,
                noShowPolicy: true,
                depositPolicy: true,
                alertNewBooking: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CONFIRMED") {
      // Already confirmed (e.g. double-submit) — just return success
      return NextResponse.json({ success: true });
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

    // Send confirmation emails (non-blocking — don't fail payment if email fails)
    try {
      const biz = booking.client.businessSettings;
      const timezone = biz?.timezone ?? "America/Chicago";
      const zonedStart = toZonedTime(booking.startTimeUtc, timezone);
      const dateTimeStr = format(zonedStart, "EEEE, MMMM d, yyyy 'at' h:mm a zzz");

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.smooveskinstudio.com";
      const manageUrl = booking.manageToken
        ? `${appUrl}/manage?token=${booking.manageToken}`
        : undefined;

      await sendConfirmationEmail({
        customerName: booking.customer.fullName,
        customerEmail: booking.customer.email,
        serviceName: booking.service.name,
        dateTime: dateTimeStr,
        duration: booking.service.durationMinutes,
        address: biz?.address ?? undefined,
        amount: `$${chargeAmount.toFixed(2)}`,
        manageUrl,
        policies: {
          cancellation: biz?.cancellationPolicy ?? undefined,
          late: biz?.latePolicy ?? undefined,
          noShow: biz?.noShowPolicy ?? undefined,
          deposit: biz?.depositPolicy ?? undefined,
        },
      });

      if (biz?.email && biz.alertNewBooking !== false) {
        await sendAdminNotificationEmail({
          adminEmail: biz.email,
          customerName: booking.customer.fullName,
          customerEmail: booking.customer.email,
          customerPhone: booking.customer.phone ?? undefined,
          serviceName: booking.service.name,
          dateTime: dateTimeStr,
          bookingId,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

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
