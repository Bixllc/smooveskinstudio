import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

interface ReportsPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const now = new Date();
  const month = parseInt(sp.month ?? String(now.getMonth() + 1), 10);
  const year = parseInt(sp.year ?? String(now.getFullYear()), 10);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.clientId,
      status: { notIn: ["CANCELLED"] },
      startTimeUtc: { gte: start, lt: end },
    },
    include: {
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
  });

  // Summary stats (including all bookings for cancelled/no-show)
  const allBookingsInMonth = await prisma.booking.findMany({
    where: {
      clientId: session.clientId,
      startTimeUtc: { gte: start, lt: end },
    },
    select: { status: true },
  });

  const totalAppointments = bookings.length;
  const revenue = bookings.reduce((sum, b) => sum + Number(b.service.price), 0);
  const cancelled = allBookingsInMonth.filter((b) => b.status === "CANCELLED").length;
  const noShows = allBookingsInMonth.filter((b) => b.status === "NO_SHOW").length;

  // Group by service
  const serviceMap: Record<
    string,
    { name: string; quantity: number; totalRevenue: number; totalMinutes: number }
  > = {};

  for (const b of bookings) {
    const svc = b.service;
    if (!serviceMap[svc.id]) {
      serviceMap[svc.id] = {
        name: svc.name,
        quantity: 0,
        totalRevenue: 0,
        totalMinutes: 0,
      };
    }
    serviceMap[svc.id].quantity += 1;
    serviceMap[svc.id].totalRevenue += Number(svc.price);
    serviceMap[svc.id].totalMinutes += svc.durationMinutes;
  }

  const rows = Object.values(serviceMap).sort((a, b) => b.quantity - a.quantity);

  return (
    <ReportsClient
      month={month}
      year={year}
      summary={{ totalAppointments, revenue, cancelled, noShows }}
      rows={rows}
    />
  );
}
