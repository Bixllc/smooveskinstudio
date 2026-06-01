import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { CalendarActions } from "./calendar-actions";

async function verifyAndConfirmPayment(paymentIntentId: string, bookingId: string) {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === "succeeded") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED", paymentStatus: "PAID", paymentId: paymentIntentId },
      });
      await prisma.payment.updateMany({
        where: { bookingId, providerPaymentId: paymentIntentId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
  } catch {
    // Verification failed — booking stays PENDING_PAYMENT
  }
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientSlug: string; bookingId: string }>;
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}) {
  const { clientSlug, bookingId } = await params;
  const { payment_intent, redirect_status } = await searchParams;

  if (payment_intent && redirect_status === "succeeded") {
    await verifyAndConfirmPayment(payment_intent, bookingId);
  }

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
    include: { businessSettings: true },
  });

  if (!client) notFound();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: client.id },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      customer: { select: { fullName: true, email: true } },
    },
  });

  if (!booking) notFound();

  const timezone = client.businessSettings?.timezone ?? "America/Chicago";
  const zonedStart = toZonedTime(booking.startTimeUtc, timezone);
  const dateStr = format(zonedStart, "EEEE, MMMM d, yyyy");
  const timeStr = format(zonedStart, "h:mm a");
  const firstName = booking.customer.fullName.split(" ")[0];

  const gcalStart = format(new Date(booking.startTimeUtc), "yyyyMMdd'T'HHmmss'Z'");
  const gcalEnd = format(
    new Date(booking.startTimeUtc.getTime() + booking.service.durationMinutes * 60000),
    "yyyyMMdd'T'HHmmss'Z'"
  );
  const gcalTitle = encodeURIComponent(`${booking.service.name} @ Smoove Skin Studio`);
  const gcalLocation = encodeURIComponent(client.businessSettings?.address ?? "Smoove Skin Studio, Watauga TX");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalStart}/${gcalEnd}&location=${gcalLocation}`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smoove Skin Studio//Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${gcalStart}`,
    `DTEND:${gcalEnd}`,
    `SUMMARY:${booking.service.name} @ Smoove Skin Studio`,
    `LOCATION:${client.businessSettings?.address ?? "Smoove Skin Studio, Watauga TX"}`,
    "DESCRIPTION:Your appointment at Smoove Skin Studio",
    `UID:${booking.id}@smooveskinstudio.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#faf7f2] ring-8 ring-[#C9A96E]/15">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1814]">
            You&apos;re booked, {firstName}!
          </h1>
          <p className="mt-2 text-[14px] text-[#6b6860]">
            {booking.status === "CONFIRMED"
              ? "Your appointment is confirmed. We can't wait to see you!"
              : "Your booking is pending. You'll hear from us shortly."}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e8e6e1] bg-white shadow-sm">
          <div className="bg-[#1a1814] px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A96E]">
              Appointment Details
            </p>
          </div>
          <div className="divide-y divide-dashed divide-[#e8e6e1] px-6">
            <div className="flex items-center justify-between py-4">
              <span className="text-[12px] text-[#9a9890]">Service</span>
              <span className="text-[14px] font-semibold text-[#1a1814]">{booking.service.name}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[12px] text-[#9a9890]">Date</span>
              <span className="text-[14px] font-medium text-[#1a1814]">{dateStr}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[12px] text-[#9a9890]">Time</span>
              <span className="text-[14px] font-medium text-[#1a1814]">{timeStr}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[12px] text-[#9a9890]">Duration</span>
              <span className="text-[14px] font-medium text-[#1a1814]">{booking.service.durationMinutes} min</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[12px] text-[#9a9890]">Total</span>
              <span className="text-[18px] font-bold text-[#1a1814]">${Number(booking.service.price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {client.businessSettings?.address && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f4f2]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#1a1814]">Studio Location</p>
              <p className="text-[13px] text-[#6b6860]">{client.businessSettings.address}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f4f2]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#1a1814]">Confirmation sent</p>
            <p className="text-[13px] text-[#6b6860]">
              Check <span className="font-medium text-[#1a1814]">{booking.customer.email}</span> for your booking details
            </p>
          </div>
        </div>

        <CalendarActions gcalUrl={gcalUrl} icsContent={icsContent} serviceName={booking.service.name} />

        {booking.manageToken && (
          <div className="mt-3">
            <Link
              href={`/manage?token=${booking.manageToken}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e6e1] py-3 text-[13px] font-medium text-[#6b6860] transition-colors hover:border-[#1a1814] hover:text-[#1a1814]"
            >
              Cancel or Reschedule
            </Link>
          </div>
        )}

        <div className="mt-3">
          <Link
            href={`/${clientSlug}/book`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A96E] py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#b8954f]"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
