import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "./sidebar";
import { AdminProviders } from "../providers";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminProviders>
      <div className="flex min-h-screen bg-[#f5f4f2]">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </AdminProviders>
  );
}
