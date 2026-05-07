import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { BookingsTable } from "./bookings-table";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status } = await searchParams;

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });

  const where: Record<string, unknown> = { clientId: session.clientId };
  if (status && status !== "all") {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { name: true } },
      customer: { select: { fullName: true, email: true } },
    },
    orderBy: { startTimeUtc: "desc" },
    take: 100,
  });

  const serialized = bookings.map((b) => ({
    id: b.id,
    customerName: b.customer.fullName,
    customerEmail: b.customer.email,
    serviceName: b.service.name,
    startTimeUtc: b.startTimeUtc.toISOString(),
    status: b.status,
    paymentStatus: b.paymentStatus,
  }));

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Bookings
      </h2>
      <BookingsTable
        bookings={serialized}
        currentStatus={status || "all"}
        timezone={settings?.timezone ?? "America/New_York"}
      />
    </div>
  );
}
