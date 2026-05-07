import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/square";
import { sendConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/square`;
    if (!verifyWebhookSignature(body, signature, webhookUrl)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Return 200 immediately — process in background
    const response = NextResponse.json({ received: true });

    // Process asynchronously (fire-and-forget)
    processWebhookEvent(event).catch((err) =>
      console.error("Webhook processing error:", err)
    );

    return response;
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

async function processWebhookEvent(event: any): Promise<void> {
  const eventType = event.type;

  if (eventType === "payment.completed") {
    await handlePaymentCompleted(event.data.object.payment);
  } else if (eventType === "payment.failed") {
    await handlePaymentFailed(event.data.object.payment);
  }
}

async function handlePaymentCompleted(payment: any): Promise<void> {
  const orderId = payment.order_id;
  if (!orderId) return;

  const booking = await prisma.booking.findFirst({
    where: { paymentId: orderId },
    include: {
      service: true,
      customer: true,
      client: { include: { businessSettings: true } },
    },
  });

  if (!booking) {
    console.error(`No booking found for order_id: ${orderId}`);
    return;
  }

  // Update booking and payment status
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      confirmationEmailSentAt: new Date(),
    },
  });

  await prisma.payment.updateMany({
    where: { bookingId: booking.id, providerPaymentId: orderId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  // Format date/time in client timezone for emails
  const settings = booking.client.businessSettings;
  const timezone = settings?.timezone || "America/New_York";
  const zonedTime = toZonedTime(booking.startTimeUtc, timezone);
  const formattedDateTime = format(zonedTime, "EEEE, MMMM d, yyyy 'at' h:mm a");

  // Send confirmation email to customer
  await sendConfirmationEmail({
    customerName: booking.customer.fullName,
    customerEmail: booking.customer.email,
    serviceName: booking.service.name,
    dateTime: formattedDateTime,
    duration: booking.service.durationMinutes,
    address: settings?.address || undefined,
    amount: `$${Number(booking.service.price).toFixed(2)}`,
    policies: settings
      ? {
          cancellation: settings.cancellationPolicy || undefined,
          late: settings.latePolicy || undefined,
          noShow: settings.noShowPolicy || undefined,
          deposit: settings.depositPolicy || undefined,
        }
      : undefined,
  });

  // Send admin notification
  if (settings?.email) {
    await sendAdminNotificationEmail({
      adminEmail: settings.email,
      customerName: booking.customer.fullName,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone || undefined,
      serviceName: booking.service.name,
      dateTime: formattedDateTime,
      bookingId: booking.id,
    });
  }
}

async function handlePaymentFailed(payment: any): Promise<void> {
  const orderId = payment.order_id;
  if (!orderId) return;

  const booking = await prisma.booking.findFirst({
    where: { paymentId: orderId },
  });

  if (!booking) return;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      paymentStatus: "FAILED",
    },
  });

  await prisma.payment.updateMany({
    where: { bookingId: booking.id, providerPaymentId: orderId },
    data: { status: "FAILED" },
  });
}
