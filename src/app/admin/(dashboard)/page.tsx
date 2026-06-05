import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [settings, client] = await Promise.all([
    prisma.businessSettings.findUnique({
      where: { clientId: session.clientId },
      select: { timezone: true },
    }),
    prisma.client.findUnique({
      where: { id: session.clientId },
      select: { slug: true },
    }),
  ]);

  const tz = settings?.timezone ?? "America/Chicago";
  const nowLocal = toZonedTime(new Date(), tz);
  const hour = nowLocal.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = format(nowLocal, "EEEE, MMM d");

  return (
    <DashboardClient greeting={greeting} dateLabel={dateLabel} tz={tz} clientSlug={client?.slug ?? ""} />
  );
}
