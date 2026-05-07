import { redirect } from "next/navigation";

export default function AdminDashboardHome() {
  redirect("/admin/bookings");
}
