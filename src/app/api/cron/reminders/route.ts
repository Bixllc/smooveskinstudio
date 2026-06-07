import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendSmsReminder } from "@/lib/sms";
import { addHours, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const clients = await prisma.client.findMany({
    where: { active: true },
    include: { businessSettings: true },
  });

  let totalSent = 0;

  for (const client of clients) {
    const settings = client.businessSettings;
    if (!settings) continue;

    const leadHours = settings.reminderLeadHours ?? 24;
    const windowStart = addHours(now, leadHours - 1);
    const windowEnd = addHours(now, leadHours);

    const bookings = await prisma.booking.findMany({
      where: {
        clientId: client.id,
        status: "CONFIRMED",
        startTimeUtc: { gte: windowStart, lt: windowEnd },
        reminderEmailSentAt: null,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    for (const booking of bookings) {
      const local = toZonedTime(booking.startTimeUtc, settings.timezone);
      const dateTime = format(local, "MMM d 'at' h:mm a");

      const manageUrl = booking.manageToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/${client.slug}/manage/${booking.manageToken}`
        : undefined;

      // Send email
      try {
        await sendReminderEmail({
          customerName: booking.customer.fullName,
          customerEmail: booking.customer.email,
          serviceName: booking.service.name,
          dateTime,
          duration: booking.service.durationMinutes,
          address: settings.address ?? undefined,
          manageUrl,
        });
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderEmailSentAt: now },
        });
      } catch (err) {
        console.error(`Email reminder failed for booking ${booking.id}:`, err);
      }

      // Send SMS if customer has phone
      if (booking.customer.phone) {
        try {
          await sendSmsReminder({
            to: booking.customer.phone,
            customerName: booking.customer.fullName,
            serviceName: booking.service.name,
            dateTime,
            businessPhone: settings.phone,
          });
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSmsSentAt: now },
          });
        } catch (err) {
          console.error(`SMS reminder failed for booking ${booking.id}:`, err);
        }
      }

      totalSent++;
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent });
}
