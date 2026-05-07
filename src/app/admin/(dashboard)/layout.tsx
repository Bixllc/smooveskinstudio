import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { businessName: true },
  });

  const businessName = settings?.businessName ?? "Admin";

  return (
    <div className="flex min-h-screen">
      <AdminSidebar businessName={businessName} />
      <main className="flex-1 overflow-auto bg-[var(--color-background)] p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
